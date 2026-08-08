import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';
import { getBackendUrl, getBackendBaseUrl } from '@/config/backend.config';
import { getLocalSiteConfig } from '@/lib/remote-fallback';

export type ServerStats = {
  totalAccounts: number;
  totalCharacters: number;
  totalGuilds: number;
  onlinePlayers: number;
};

const FETCH_TIMEOUT_MS = 8000;

function emptyStats(): ServerStats {
  return {
    totalAccounts: 0,
    totalCharacters: 0,
    totalGuilds: 0,
    onlinePlayers: 0,
  };
}

function normalizeStats(raw: Record<string, unknown> | null | undefined): ServerStats {
  if (!raw) return emptyStats();
  return {
    totalAccounts: Math.max(0, Number(raw.totalAccounts ?? raw.TotalAccounts ?? 0) || 0),
    totalCharacters: Math.max(0, Number(raw.totalCharacters ?? raw.TotalCharacters ?? 0) || 0),
    totalGuilds: Math.max(0, Number(raw.totalGuilds ?? raw.TotalGuilds ?? 0) || 0),
    onlinePlayers: Math.max(0, Number(raw.onlinePlayers ?? raw.OnlinePlayers ?? 0) || 0),
  };
}

function backendCandidateUrls(path: string): string[] {
  const urls = [getBackendUrl(path)];
  const isDev = process.env.NODE_ENV === 'development';
  const base = getBackendBaseUrl();
  if (isDev && !base.includes('127.0.0.1') && !base.includes('localhost')) {
    urls.push(`http://127.0.0.1:3001${path}`);
  }
  return urls;
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function fetchStatsFromBackend(): Promise<ServerStats> {
  for (const url of backendCandidateUrls('/api/stats')) {
    const json = await fetchJson(url);
    if (json?.success && json.data && typeof json.data === 'object') {
      return normalizeStats(json.data as Record<string, unknown>);
    }
  }
  return emptyStats();
}

/** Đọc statsBoost từ config backend (hoặc fallback local) */
async function fetchStatsBoost(): Promise<ServerStats> {
  for (const url of backendCandidateUrls('/api/config')) {
    const json = await fetchJson(url);
    if (json?.success && json.data && typeof json.data === 'object') {
      const data = json.data as Record<string, unknown>;
      const boost = data.statsBoost;
      if (boost && typeof boost === 'object') {
        return normalizeStats(boost as Record<string, unknown>);
      }
    }
  }

  const local = getLocalSiteConfig();
  const boost = local.statsBoost;
  if (boost && typeof boost === 'object') {
    return normalizeStats(boost as Record<string, unknown>);
  }
  return emptyStats();
}

function addStats(a: ServerStats, b: ServerStats): ServerStats {
  return {
    totalAccounts: a.totalAccounts + b.totalAccounts,
    totalCharacters: a.totalCharacters + b.totalCharacters,
    totalGuilds: a.totalGuilds + b.totalGuilds,
    onlinePlayers: a.onlinePlayers + b.onlinePlayers,
  };
}

export async function GET(request: NextRequest) {
  try {
    let securityCheck: Awaited<ReturnType<typeof securityMiddleware>>;
    try {
      securityCheck = await securityMiddleware(request, '/api/stats');
    } catch (mwErr) {
      console.error('Stats securityMiddleware:', mwErr);
      const boost = await fetchStatsBoost();
      return NextResponse.json({
        success: true,
        data: boost,
        message: 'Chỉ hiển thị statsBoost (security).',
      });
    }
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: securityCheck.error || 'Request không hợp lệ',
        },
        { status: securityCheck.statusCode || 400 }
      );
    }

    const [real, boost] = await Promise.all([fetchStatsFromBackend(), fetchStatsBoost()]);
    const data = addStats(real, boost);

    return NextResponse.json(
      {
        success: true,
        data,
        meta: { real, boost },
        message: 'Thống kê = số thật DB + statsBoost config.',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      success: true,
      data: emptyStats(),
      message: 'Lỗi lấy thống kê server.',
    });
  }
}
