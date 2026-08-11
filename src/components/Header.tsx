'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Trang Chủ', href: '/' },
  { label: 'Tải Game', href: '/download' },
  { label: 'Bản Tin', href: '/news' },
  { label: 'Xếp Hạng', href: '/rankings' },
  { label: 'Đăng Ký', href: '/register' },
  { label: 'Đăng Nhập', href: '/login' },
];

const MOBILE_NAV_MQ = '(max-width: 900px)';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const update = () => setIsMobileNav(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const syncBodyScroll = () => {
      const lock = mq.matches && menuOpen;
      document.body.style.overflow = lock ? 'hidden' : '';
    };
    syncBodyScroll();
    mq.addEventListener('change', syncBodyScroll);
    return () => {
      document.body.style.overflow = '';
      mq.removeEventListener('change', syncBodyScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !isMobileNav) return;

    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      const header = document.querySelector('.we-nav');
      if (header && !header.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('touchstart', closeOnOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('touchstart', closeOnOutside);
    };
  }, [menuOpen, isMobileNav]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const showNavLinks = !isMobileNav || menuOpen;

  return (
    <header className={`we-nav${isMobileNav ? ' we-nav--mobile' : ''}`}>
      <div className="we-nav-bar">
        <Link href="/" className="we-nav-brand" onClick={() => setMenuOpen(false)}>
          MUDAUTRUONGSS1.NET
        </Link>
        {isMobileNav && (
          <button
            type="button"
            className={`we-nav-toggle${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
          >
            <span className="we-nav-toggle-bar" />
            <span className="we-nav-toggle-bar" />
            <span className="we-nav-toggle-bar" />
          </button>
        )}
      </div>
      {showNavLinks && (
      <nav className={`we-nav-inner${menuOpen ? ' open' : ''}`}>
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`we-nav-link${isActive(item.href) ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      )}
    </header>
  );
}
