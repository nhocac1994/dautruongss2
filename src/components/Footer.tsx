'use client';

import React, { useState, useEffect } from 'react';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, type SiteConfig } from '@/lib/config-api';

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
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="we-clock">
      <div className="we-clock-label">{label}</div>
      <div className="we-clock-time">{time || '--:--'}</div>
      <div className="we-clock-date">{date}</div>
    </div>
  );
}

export default function Footer() {
  const [config, setConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);

  useEffect(() => {
    getSiteConfig().then((c) => { if (c) setConfig({ ...siteConfigStatic, ...c } as SiteConfig); });
  }, []);

  const serverName = config?.serverName || config?.nameGame || 'MUDAUTRUONGSS1.NET';
  const gameTitle = config?.gameTitle || 'Mu Online Season 1.0';
  const year = new Date().getFullYear();

  return (
    <footer className="we-footer">
      <div className="we-footer-inner">
        <div className="we-footer-grid">
          <div>
            <p className="we-footer-copy">© {year} {gameTitle}</p>
            <p className="we-footer-copy" style={{ fontSize: 11 }}>
              This site is in no way associated with or endorsed by Webzen Inc.
            </p>
            <p className="we-footer-desc">
              {gameTitle} — <strong>Bản chuẩn Season 1.0, không hạ cấp</strong>.
              Trải nghiệm đầy đủ class và hệ thống Season 1.0 chuẩn cùng cộng đồng {serverName}.
            </p>
            <p className="we-footer-powered">Powered by MUDAUTRUONGSS1.NET</p>
            <p className="we-footer-provider">
              File game cung cấp bởi{' '}
              <a href="https://www.mumges.org/" target="_blank" rel="noopener noreferrer">
                mumges.org
              </a>
            </p>
          </div>
          <div>
            <div className="we-clocks">
              <Clock label="Server Time" />
              <Clock label="Your Time" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
