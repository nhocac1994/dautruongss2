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

function addStats(a: ServerStats, b: ServerStats): ServerStats {
  return {
    totalAccounts: a.totalAccounts + b.totalAccounts,
    totalCharacters: a.totalCharacters + b.totalCharacters,
    totalGuilds: a.totalGuilds + b.totalGuilds,
    onlinePlayers: a.onlinePlayers + b.onlinePlayers,
  };
}

function backendUrls(path: string): string[] {
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

async function fetchBackendStats(): Promise<{
  data: ServerStats;
  boosted: boolean;
  real?: ServerStats;
  boost?: ServerStats;
} | null> {
  for (const url of backendUrls('/api/stats')) {
    const json = await fetchJson(url);
    if (!json?.success || !json.data || typeof json.data !== 'object') continue;
    const meta = (json.meta && typeof json.meta === 'object'
      ? (json.meta as Record<string, unknown>)
      : {}) as Record<string, unknown>;
    return {
      data: normalizeStats(json.data as Record<string, unknown>),
      boosted: meta.boosted === true,
      real: meta.real && typeof meta.real === 'object'
        ? normalizeStats(meta.real as Record<string, unknown>)
        : undefined,
      boost: meta.boost && typeof meta.boost === 'object'
        ? normalizeStats(meta.boost as Record<string, unknown>)
        : undefined,
    };
  }
  return null;
}

async function fetchConfigBoost(): Promise<ServerStats> {
  for (const url of backendUrls('/api/config')) {
    const json = await fetchJson(url);
    if (!json?.success || !json.data || typeof json.data !== 'object') continue;
    const data = json.data as Record<string, unknown>;
    if (data.statsBoost && typeof data.statsBoost === 'object') {
      return normalizeStats(data.statsBoost as Record<string, unknown>);
    }
  }
  const local = getLocalSiteConfig();
  if (local.statsBoost && typeof local.statsBoost === 'object') {
    return normalizeStats(local.statsBoost as Record<string, unknown>);
  }
  return emptyStats();
}

/**
 * Proxy thống kê.
 * - Backend mới: đã cộng statsBoost → dùng luôn.
 * - Backend cũ: chỉ số DB → frontend cộng statsBoost từ /api/config.
 */
export async function GET(request: NextRequest) {
  try {
    let securityCheck: Awaited<ReturnType<typeof securityMiddleware>>;
    try {
      securityCheck = await securityMiddleware(request, '/api/stats');
    } catch (mwErr) {
      console.error('Stats securityMiddleware:', mwErr);
      const boost = await fetchConfigBoost();
      return NextResponse.json({
        success: true,
        data: boost,
        meta: { boosted: true, boost, real: emptyStats() },
        message: 'Chỉ statsBoost (security).',
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

    const fromBackend = await fetchBackendStats();
    const configBoost = await fetchConfigBoost();

    if (fromBackend?.boosted) {
      return NextResponse.json(
        {
          success: true,
          data: fromBackend.data,
          meta: {
            real: fromBackend.real ?? emptyStats(),
            boost: fromBackend.boost ?? configBoost,
            boosted: true,
            source: 'backend',
          },
          message: 'Thống kê từ backend (đã cộng statsBoost).',
        },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    const real = fromBackend?.data ?? emptyStats();
    const data = addStats(real, configBoost);

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          real,
          boost: configBoost,
          boosted: true,
          source: fromBackend ? 'frontend-boost' : 'boost-only',
        },
        message: 'Thống kê = số thật + statsBoost config.',
      },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
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
