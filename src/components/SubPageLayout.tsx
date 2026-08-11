import React from 'react';
import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type SubPageLayoutProps = {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showSidebar?: boolean;
  maxWidth?: string;
  centered?: boolean;
};

export default function SubPageLayout({
  breadcrumbs,
  title,
  subtitle,
  children,
}: SubPageLayoutProps) {
  return (
    <div className="ns-subpage">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="ns-home-kicker" style={{ marginBottom: 12 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Bản tin
          </Link>
          {breadcrumbs.map((item, i) => (
            <span key={`${item.label}-${i}`}>
              {' / '}
              {item.href ? (
                <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: 'var(--ns-text-muted)' }}>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {title && <h1 className="ns-home-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>{title}</h1>}
      {subtitle && <p className="ns-home-desc" style={{ marginBottom: 24 }}>{subtitle}</p>}

      {children}
    </div>
  );
}
