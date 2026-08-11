'use client';

import React, { useEffect, useState } from 'react';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, type SiteConfig } from '@/lib/config-api';

type Props = {
  brandName?: string;
  gameTitle?: string;
};

type ServerStats = {
  totalAccounts: number;
  totalCharacters: number;
  totalGuilds: number;
  onlinePlayers: number;
};

function formatStat(n: number): string {
  return n.toLocaleString('en-US');
}

function Clock({ label }: { label: string }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ns-clock">
      <div className="ns-clock-label">{label}</div>
      <div className="ns-clock-time">{time || '--:--'}</div>
      <div className="ns-clock-date">{date || '—'}</div>
    </div>
  );
}

export default function SeasonFooter({ brandName, gameTitle }: Props) {
  const [config, setConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);
  const [stats, setStats] = useState<ServerStats | null>(null);

  useEffect(() => {
    getSiteConfig().then((c) => {
      if (c) setConfig({ ...siteConfigStatic, ...c } as SiteConfig);
    });
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
        .catch(() => {});
    };
    loadStats();
    const id = setInterval(loadStats, 60_000);
    return () => clearInterval(id);
  }, []);

  const year = new Date().getFullYear();
  const title =
    gameTitle ||
    config.gameTitle ||
    config.serverInfo?.name ||
    'Mu Online Season 1.0';
  const community =
    config.websiteName ||
    config.serverName ||
    brandName ||
    config.nameGame ||
    'MUDAUTRUONGSS1.NET';
  const websiteHost = (() => {
    try {
      if (config.websiteUrl) return new URL(config.websiteUrl).hostname.replace(/^www\./, '').toUpperCase();
    } catch {
      /* ignore */
    }
    return String(community).replace(/^www\./i, '').toUpperCase();
  })();

  const version = config.serverInfo?.version || config.serverVersion || 'Season 1.0';
  const expRate = config.serverInfo?.expRate || (config as { expRate?: string }).expRate || 'x50';
  const dropRate = config.serverInfo?.dropRate || (config as { dropRate?: string }).dropRate || '90%';

  const accounts = stats?.totalAccounts ?? 0;
  const characters = stats?.totalCharacters ?? 0;
  const guilds = stats?.totalGuilds ?? 0;
  const online = stats?.onlinePlayers ?? 0;

  const zalo = config.linkZalo || config.socialMedia?.zalo || '#';
  const tiktok = config.linkTikTok || config.socialMedia?.tiktok || '#';
  const youtube = config.linkYoutube || config.socialMedia?.youtube || '#';
  const facebook = config.linkFacebook || config.socialMedia?.facebook || '#';

  const socials = [
    { href: facebook, label: 'Facebook', src: '/facebook-logo.webp' },
    { href: zalo, label: 'Zalo', src: '/Zalo-icon.webp' },
    { href: tiktok, label: 'TikTok', src: '/tiktok-logo.webp' },
    { href: youtube, label: 'YouTube', src: '/youtube-logo.webp' },
  ];

  return (
    <footer className="ns-footer">
      <div className="ns-footer-inner">
        <div className="ns-footer-grid">
          <div className="ns-footer-about">
            <p className="ns-footer-copy">© {year} {title}</p>
            <p className="ns-footer-disclaimer">
              This site is in no way associated with or endorsed by Webzen Inc.
            </p>
            <p className="ns-footer-desc">
              {title} — Trải nghiệm phiên bản Season 1.0 cổ điển với các class Dark Knight, Dark Wizard, Fairy Elf.
              Khám phá Lorencia, Devias và nhiều bản đồ huyền thoại khác cùng cộng đồng {websiteHost}.
            </p>
            <p className="ns-footer-powered">Powered by {websiteHost}</p>
          </div>

          <div className="ns-footer-clocks">
            <Clock label="Server Time" />
            <Clock label="Your Time" />
          </div>

          <div className="ns-footer-stats">
            <p className="ns-footer-heading">Thông tin server</p>
            <table className="ns-stats-table">
              <tbody>
                <tr>
                  <td>Phiên bản</td>
                  <td>{version}</td>
                </tr>
                <tr>
                  <td>Chuẩn</td>
                  <td>Không hạ cấp</td>
                </tr>
                <tr>
                  <td>Kinh nghiệm</td>
                  <td>{expRate}</td>
                </tr>
                <tr>
                  <td>Tỷ lệ rơi đồ</td>
                  <td>{dropRate}</td>
                </tr>
                <tr>
                  <td>Tổng số Tài khoản</td>
                  <td>{formatStat(accounts)}</td>
                </tr>
                <tr>
                  <td>Tổng số Nhân vật</td>
                  <td>{formatStat(characters)}</td>
                </tr>
                <tr>
                  <td>Tổng số Guilds</td>
                  <td>{formatStat(guilds)}</td>
                </tr>
                <tr>
                  <td>Số người Online</td>
                  <td>{formatStat(online)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ns-footer-socials">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="ns-social-btn"
                aria-label={s.label}
                title={s.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.label} width={28} height={28} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
