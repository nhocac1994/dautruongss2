'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import {
  getNewsList,
  newsArticleLink,
  type NewsArticleListItem,
} from '@/lib/news-api';

const FALLBACK_GUIDES = [
  { slug: 'guide', title: 'Hướng Dẫn Tân Thủ — Quà Tân Thủ', hot: true },
  { slug: 'events', title: 'Lệnh Cơ Bản (/add, /reset, /pkclear...)' },
  { slug: 'roadmap', title: 'Tỷ Lệ Nâng Cấp Chaos Goblin' },
  { slug: 'opening', title: 'Hướng Dẫn Blood Castle' },
  { slug: 'maps', title: 'Hướng Dẫn Devil Square' },
];

export default function GuidePage() {
  const [guides, setGuides] = useState(FALLBACK_GUIDES);
  const [activeSlug, setActiveSlug] = useState('guide');

  useEffect(() => {
    getNewsList().then((list) => {
      if (list.length > 0) {
        setGuides(
          list.map((n: NewsArticleListItem, i) => ({
            slug: n.slug,
            title: n.title,
            hot: n.type === 'Hot' || i === 0,
          }))
        );
        setActiveSlug(list[0].slug);
      }
    });
  }, []);

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: 'Hướng Dẫn' }]} title="Danh Sách Hướng Dẫn Chơi Game">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={newsArticleLink(g.slug)}
            className={`we-guide-item${activeSlug === g.slug ? ' active' : ''}`}
            onClick={() => setActiveSlug(g.slug)}
          >
            {g.hot && <span className="we-guide-badge">Hot</span>}
            {g.title}
          </Link>
        ))}
      </SubPageLayout>
    </div>
  );
}
