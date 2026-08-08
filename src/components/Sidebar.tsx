'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, getEventsConfig, type SiteConfig, type EventConfig } from '@/lib/config-api';
import ClassIcon from '@/components/ClassIcon';

interface PlayerRow {
  character: string;
  class: number;
  score?: number;
  level?: number | null;
}

interface ServerStats {
  totalAccounts: number;
  totalCharacters: number;
  totalGuilds: number;
  onlinePlayers: number;
}

const EMPTY_BOOST: ServerStats = {
  totalAccounts: 0,
  totalCharacters: 0,
  totalGuilds: 0,
  onlinePlayers: 0,
};

function formatStat(n: number): string {
  return n.toLocaleString('en-US');
}

function readStatsBoost(raw: unknown): ServerStats {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_BOOST };
  const o = raw as Record<string, unknown>;
  return {
    totalAccounts: Math.max(0, Number(o.totalAccounts) || 0),
    totalCharacters: Math.max(0, Number(o.totalCharacters) || 0),
    totalGuilds: Math.max(0, Number(o.totalGuilds) || 0),
    onlinePlayers: Math.max(0, Number(o.onlinePlayers) || 0),
  };
}

/** Tên hiển thị gọn (bỏ ngoặc vuông) */
function eventDisplayName(name: string): string {
  return name.replace(/[[\]]/g, '').trim();
}

function scheduleMatches(ev: EventConfig, hour: number, minute: number): boolean {
  const s = ev.schedule;
  if (s.type === 'hourly') {
    const interval = s.interval || 2;
    const startMinute = s.startMinute || 0;
    if (minute !== startMinute) return false;
    return hour % interval === (startMinute === 0 ? 0 : 1);
  }
  if (s.type === 'specific') {
    return (s.times || []).some((t) => {
      const [h, m] = t.split(':').map(Number);
      return h === hour && m === minute;
    });
  }
  return false;
}

/** Tính số giây còn lại tới lần mở kế tiếp (hoặc thời gian còn lại nếu đang diễn ra) */
function computeEvent(ev: EventConfig, now: Date): { seconds: number; running: boolean } {
  const h = now.getHours();
  const m = now.getMinutes();
  const sec = now.getSeconds();
  const duration = ev.schedule.duration || 10;

  if (scheduleMatches(ev, h, m) && sec < duration * 60) {
    return { seconds: duration * 60 - sec, running: true };
  }

  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const startHour = dayOffset === 0 ? h : 0;
    for (let hour = startHour; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        if (!scheduleMatches(ev, hour, minute)) continue;
        const t = new Date(now);
        t.setDate(t.getDate() + dayOffset);
        t.setHours(hour, minute, 0, 0);
        const diff = Math.floor((t.getTime() - now.getTime()) / 1000);
        if (diff > 0) return { seconds: diff, running: false };
      }
    }
  }
  return { seconds: 0, running: false };
}

function formatCountdown(seconds: number): string {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = Math.floor(seconds % 60);
  return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

export default function Sidebar() {
  const [config, setConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);
  const [statsBoost, setStatsBoost] = useState<ServerStats>(() =>
    readStatsBoost((siteConfigStatic as { statsBoost?: unknown }).statsBoost)
  );
  const [topPlayers, setTopPlayers] = useState<PlayerRow[]>([]);
  const [rankLoading, setRankLoading] = useState(true);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Đọc thẳng /api/remote/config (cùng nguồn với phiên bản/EXP) để lấy statsBoost
    fetch('/api/remote/config', { cache: 'no-store' })
      .then((r) => r.json())
      .then((result) => {
        if (!result?.success || !result.data) return;
        const data = result.data as SiteConfig & { statsBoost?: unknown };
        const boost = readStatsBoost(data.statsBoost);
        setStatsBoost(boost);
        setConfig({
          ...siteConfigStatic,
          ...data,
          statsBoost: boost,
        } as SiteConfig);
      })
      .catch(() => {
        getSiteConfig().then((c) => {
          if (!c) return;
          const boost = readStatsBoost(c.statsBoost);
          setStatsBoost(boost);
          setConfig({ ...siteConfigStatic, ...c, statsBoost: boost } as SiteConfig);
        });
      });
  }, []);

  useEffect(() => {
    getEventsConfig().then((evs) => { if (evs && evs.length > 0) setEvents(evs); });
  }, []);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loadStats = () => {
      fetch('/api/stats', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setStats({
              totalAccounts: Number(data.data.totalAccounts ?? 0),
              totalCharacters: Number(data.data.totalCharacters ?? 0),
              totalGuilds: Number(data.data.totalGuilds ?? 0),
              onlinePlayers: Number(data.data.onlinePlayers ?? 0),
            });
          }
        })
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    };
    loadStats();
    const id = setInterval(loadStats, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/rankings/level')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTopPlayers(
            data.data.slice(0, 10).map((c: Record<string, unknown>) => ({
              character: String(c.character ?? c.Name ?? ''),
              class: Number(c.class ?? c.Class ?? 0),
              score: Number(c.score ?? c.Score ?? c.resets ?? 0),
              level: c.level != null ? Number(c.level) : c.cLevel != null ? Number(c.cLevel) : null,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setRankLoading(false));
  }, []);

  const cfg = config;
  const zaloLink = cfg?.linkZalo || cfg?.socialMedia?.zalo || '';
  const youtubeLink = cfg?.linkYoutube || cfg?.socialMedia?.youtube || '';
  const tiktokLink = cfg?.linkTikTok || cfg?.socialMedia?.tiktok || '';
  const expRate = cfg?.serverInfo?.expRate || 'x100';
  const dropRate = cfg?.serverInfo?.dropRate || '50%';
  const version = cfg?.serverInfo?.version || cfg?.serverVersion || 'Season 2.0';
  /* Hiển thị = số thật (/api/stats) + statsBoost (config) */
  const displayAccounts = (stats?.totalAccounts ?? 0) + statsBoost.totalAccounts;
  const displayCharacters = (stats?.totalCharacters ?? 0) + statsBoost.totalCharacters;
  const displayGuilds = (stats?.totalGuilds ?? 0) + statsBoost.totalGuilds;
  const displayOnline = (stats?.onlinePlayers ?? 0) + statsBoost.onlinePlayers;

  return (
    <aside className="we-sidebar-col">
      {/* Mạng xã hội: Zalo / YouTube / TikTok */}
      <div className="we-box">
        <div className="we-box-head">Mạng xã hội</div>
        <div className="we-box-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
          {zaloLink && (
            <a href={zaloLink} target="_blank" rel="noopener noreferrer" className="we-zalo-item">
              <Image src="/Zalo-icon.webp" alt="Zalo" width={28} height={28} className="we-zalo-icon" />
              ZALO
            </a>
          )}
          {youtubeLink && (
            <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="we-zalo-item">
              <Image src="/youtube-logo.webp" alt="YouTube" width={28} height={28} className="we-zalo-icon" />
              YOUTUBE
            </a>
          )}
          {tiktokLink && (
            <a href={tiktokLink} target="_blank" rel="noopener noreferrer" className="we-zalo-item">
              <Image src="/tiktok-logo.webp" alt="TikTok" width={28} height={28} className="we-zalo-icon" />
              TIKTOK
            </a>
          )}
        </div>
      </div>

      {/* Thông tin server */}
      <div className="we-box">
        <div className="we-box-head">Thông tin Server</div>
        <div className="we-box-body">
          <table className="we-info-table">
            <tbody>
              <tr>
                <td>Phiên bản</td>
                <td className="we-val-orange">{version}</td>
              </tr>
              <tr>
                <td>Chuẩn</td>
                <td className="we-val-orange" style={{ fontWeight: 700 }}>Không hạ cấp</td>
              </tr>
              <tr>
                <td>Kinh nghiệm</td>
                <td className="we-val-blue">{expRate}</td>
              </tr>
              <tr>
                <td>Tỷ lệ rơi đồ</td>
                <td>{dropRate}</td>
              </tr>
              <tr>
                <td>Tổng số Tài khoản</td>
                <td className="we-val-orange">
                  {statsLoading ? '…' : formatStat(displayAccounts)}
                </td>
              </tr>
              <tr>
                <td>Tổng số Nhân vật</td>
                <td className="we-val-orange">
                  {statsLoading ? '…' : formatStat(displayCharacters)}
                </td>
              </tr>
              <tr>
                <td>Tổng số Guilds</td>
                <td className="we-val-blue">
                  {statsLoading ? '…' : formatStat(displayGuilds)}
                </td>
              </tr>
              <tr>
                <td>Số người Online</td>
                <td style={{ fontWeight: 700, color: '#16a34a' }}>
                  {statsLoading ? '…' : formatStat(displayOnline)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Time */}
      {events.length > 0 && (
        <div className="we-box">
          <div className="we-box-head">Event Time</div>
          <div className="we-box-body">
            <table className="we-event-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const state = now ? computeEvent(ev, now) : null;
                  const timeStr = !state
                    ? '--:--:--'
                    : state.running
                      ? 'Đang diễn ra'
                      : formatCountdown(state.seconds);
                  const soon = !!state && !state.running && state.seconds <= 300;
                  return (
                    <tr key={ev.id}>
                      <td>{eventDisplayName(ev.name)}</td>
                      <td
                        className={`we-event-time${state?.running ? ' is-running' : ''}${soon ? ' is-soon' : ''}`}
                      >
                        {timeStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Reset */}
      <div className="we-box">
        <div className="we-box-head">
          Top Reset
          <Link href="/rankings" style={{ fontSize: 18, color: 'var(--we-red)', textDecoration: 'none' }}>+</Link>
        </div>
        <div className="we-box-body">
          {rankLoading ? (
            <div className="we-loading-center"><div className="we-spinner" /></div>
          ) : topPlayers.length === 0 ? (
            <p style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>Chưa có dữ liệu</p>
          ) : (
            <table className="we-mini-rank">
              <thead>
                <tr>
                  <th>Nhân vật</th>
                  <th style={{ textAlign: 'right' }}>Reset</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((p, i) => (
                  <tr key={`${p.character}-${i}`}>
                    <td>
                      <ClassIcon classId={p.class} size={22} className="we-class-icon--inline" />
                      {p.character}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{p.score ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </aside>
  );
}
