'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import NewsSearchBar, { matchNews } from '@/components/NewsSearchBar';
import {
  getNewsList,
  formatNewsDateLong,
  newsArticleLink,
  type NewsArticleListItem,
} from '@/lib/news-api';

const FALLBACK_NEWS = [
  { type: 'Notice', title: 'Hướng dẫn chơi — Season 1.0', date: '2026-04-15', link: '/news/guide', slug: 'guide', excerpt: 'Hướng dẫn Season 1.0 bản chuẩn — không hạ cấp.' },
  { type: 'Event', title: 'Các sự kiện trong game', date: '2026-04-15', link: '/news/events', slug: 'events', excerpt: 'Double EXP và sự kiện đặc biệt.' },
  { type: 'Update', title: 'Lộ trình phát triển server', date: '2026-04-15', link: '/news/roadmap', slug: 'roadmap', excerpt: 'Kế hoạch phát triển server.' },
  { type: 'Notice', title: 'Thông báo mở server', date: '2026-04-15', link: '/news/opening', slug: 'opening', excerpt: 'Thông báo mở cửa server.' },
  { type: 'Hot', title: 'Thông tin các map', date: '2026-04-15', link: '/news/maps', slug: 'maps', excerpt: 'Thông tin các bản đồ.' },
];

const ITEMS_PER_PAGE = 5;

export default function NewsPage() {
  const [items, setItems] = useState(FALLBACK_NEWS);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    getNewsList().then((list) => {
      if (list.length > 0) {
        setItems(
          list.map((n: NewsArticleListItem) => ({
            type: n.type,
            title: n.title,
            date: n.publishedAt,
            link: newsArticleLink(n.slug),
            slug: n.slug,
            excerpt: n.excerpt,
          }))
        );
      }
      setLoading(false);
    });
  }, []);

  const filteredItems = searchQuery.trim()
    ? items.filter((item) => matchNews(item, searchQuery))
    : items;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const pageItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: 'Bản Tin' }]} title="Bản Tin" showSidebar={false}>
        {loading ? (
          <div className="we-loading-center"><div className="we-spinner" /></div>
        ) : (
          <>
            <NewsSearchBar items={items} onQueryChange={setSearchQuery} />

            {pageItems.length === 0 ? (
              <p className="we-news-search-no-result">
                Không có bản tin nào khớp với &quot;{searchQuery}&quot;.
              </p>
            ) : (
              pageItems.map((item) => (
              <article key={item.link} className="we-news-card">
                <div className={`we-news-card-head t-${item.type.toLowerCase()}`}>
                  <h3>
                    <span className="we-news-badge">{item.type.toUpperCase()}</span>
                    {item.title}
                  </h3>
                </div>
                <div className="we-news-card-body">
                  <h4>{item.title}</h4>
                  <p>{item.excerpt}</p>
                  <Link href={item.link} className="we-read-more">Xem thêm ›</Link>
                </div>
                <div className="we-news-footer">
                  Đăng bởi Quản trị viên, {formatNewsDateLong(item.date)}
                </div>
              </article>
              ))
            )}

            {pageItems.length > 0 && totalPages > 1 && (
              <div className="we-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`we-page-btn${currentPage === page ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </SubPageLayout>
    </div>
  );
}
