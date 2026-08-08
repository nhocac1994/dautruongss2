import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/lib/security-middleware';
import { getBackendUrl, getBackendBaseUrl } from '@/config/backend.config';

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
    totalAccounts: Number(raw.totalAccounts ?? raw.TotalAccounts ?? 0),
    totalCharacters: Number(raw.totalCharacters ?? raw.TotalCharacters ?? 0),
    totalGuilds: Number(raw.totalGuilds ?? raw.TotalGuilds ?? 0),
    onlinePlayers: Number(raw.onlinePlayers ?? raw.OnlinePlayers ?? 0),
  };
}

async function fetchStatsFromBackend(): Promise<{ data: ServerStats; message: string } | null> {
  const urls = [getBackendUrl('/api/stats')];
  const isDev = process.env.NODE_ENV === 'development';
  const local = 'http://127.0.0.1:3001/api/stats';
  const base = getBackendBaseUrl();
  if (isDev && !base.includes('127.0.0.1') && !base.includes('localhost')) {
    urls.push(local);
  }

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const json = (await res.json()) as {
        success?: boolean;
        data?: Record<string, unknown>;
        message?: string;
      };
      if (json.success && json.data) {
        return {
          data: normalizeStats(json.data),
          message: json.message || 'Thống kê server từ database.',
        };
      }
    } catch {
      /* thử URL tiếp */
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    let securityCheck: Awaited<ReturnType<typeof securityMiddleware>>;
    try {
      securityCheck = await securityMiddleware(request, '/api/stats');
    } catch (mwErr) {
      console.error('Stats securityMiddleware:', mwErr);
      return NextResponse.json({
        success: true,
        data: emptyStats(),
        message: 'Không lấy được thống kê (security).',
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

    const result = await fetchStatsFromBackend();
    if (!result) {
      return NextResponse.json({
        success: true,
        data: emptyStats(),
        message: 'Backend stats chưa kết nối được.',
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
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
