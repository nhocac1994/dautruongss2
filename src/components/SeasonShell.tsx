'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig } from '@/lib/config-api';
import EventsDock from '@/components/EventsDock';
import SeasonFooter from '@/components/SeasonFooter';
import PageBackrow from '@/components/PageBackrow';

type EventsCtx = {
  openEvents: () => void;
  closeEvents: () => void;
  eventsOpen: boolean;
};

const EventsContext = createContext<EventsCtx | null>(null);

export function useEventsPopup() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEventsPopup must be used within SeasonShell');
  return ctx;
}

const navLinks = [
  { label: 'Bản tin', href: '/' },
  { label: 'Đăng ký', href: '/register' },
  { label: 'Đăng nhập', href: '/login' },
  { label: 'Tải game', href: '/download' },
  { label: 'Xếp hạng', href: '/rankings' },
] as const;

export default function SeasonShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [brand, setBrand] = useState({
    name: (siteConfigStatic as { nameGame?: string }).nameGame || 'MUDAUTRUONGSS1.NET',
    sub: (siteConfigStatic as { gameTitle?: string }).gameTitle || 'Mu Online Season 1.0',
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    getSiteConfig().then((c) => {
      if (!c) return;
      setBrand({
        name: c.nameGame || c.serverName || brand.name,
        sub: c.gameTitle || brand.sub,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || eventsOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, eventsOpen]);

  const openEvents = useCallback(() => {
    setEventsOpen(true);
    setMenuOpen(false);
  }, []);
  const closeEvents = useCallback(() => setEventsOpen(false), []);

  const eventsCtx = useMemo(
    () => ({ openEvents, closeEvents, eventsOpen }),
    [openEvents, closeEvents, eventsOpen]
  );

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <EventsContext.Provider value={eventsCtx}>
      <div className="ns-shell">
        <div className="ns-backrow" aria-hidden>
          <PageBackrow />
        </div>

        <header className={`ns-header${menuOpen ? ' is-menu-open' : ''}`}>
          <div className="ns-header-inner">
            <Link href="/" className="ns-brand" onClick={() => setMenuOpen(false)}>
              <img
                src="/NAME.webp"
                alt=""
                className="ns-brand-icon"
                width={48}
                height={48}
              />
              <span className="ns-brand-text">
                <span className="ns-brand-name">{brand.name}</span>
                <span className="ns-brand-sub">{brand.sub}</span>
              </span>
            </Link>

            <button
              type="button"
              className={`ns-menu-toggle${menuOpen ? ' is-open' : ''}`}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>

            <nav className="ns-header-nav ns-header-nav--desktop" aria-label="Menu chính">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ns-nav-link${isActive(item.href) ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button type="button" className="ns-nav-btn" onClick={openEvents}>
                Sự kiện
              </button>
            </nav>
          </div>
        </header>

        {menuOpen && (
          <div className="ns-nav-backdrop open" onClick={() => setMenuOpen(false)} aria-hidden />
        )}

        <nav
          className={`ns-mobile-nav${menuOpen ? ' open' : ''}`}
          aria-label="Menu mobile"
          hidden={!menuOpen}
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`ns-nav-link${isActive(item.href) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button type="button" className="ns-nav-btn" onClick={openEvents}>
            Sự kiện
          </button>
        </nav>

        <main className="ns-main">
          <div className="ns-main-inner">{children}</div>
        </main>

        <SeasonFooter brandName={brand.name} gameTitle={brand.sub} />
      </div>

      <EventsDock open={eventsOpen} onOpen={openEvents} onClose={closeEvents} />
    </EventsContext.Provider>
  );
}
