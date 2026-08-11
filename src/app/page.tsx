'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNewsList, newsArticleLink, formatNewsDateLong, type NewsArticleListItem } from '@/lib/news-api';

const FALLBACK_NEWS = [
  { title: 'HƯỚNG DẪN CHƠI - SEASON 1.0', excerpt: 'Hướng dẫn chi tiết cách chơi Season 1.0 bản chuẩn, từ tạo nhân vật đến các tính năng nâng cao.', link: '/news/guide', type: 'Notice', date: '2026-04-15' },
  { title: 'CÁC SỰ KIỆN TRONG GAME', excerpt: 'Double EXP, Drop Rate Event, PK Tournament và nhiều sự kiện đặc biệt.', link: '/news/events', type: 'Event', date: '2026-04-15' },
  { title: 'LỘ TRÌNH PHÁT TRIỂN SERVER', excerpt: 'Kế hoạch phát triển, tính năng mới và cải thiện trải nghiệm.', link: '/news/roadmap', type: 'Update', date: '2026-04-15' },
  { title: 'THÔNG BÁO MỞ SERVER', excerpt: 'Thông báo chính thức mở cửa server.', link: '/news/opening', type: 'Notice', date: '2026-04-15' },
  { title: 'THÔNG TIN CÁC MAP', excerpt: 'Bảng Zen, PK và tỷ lệ drop ngọc theo từng bản đồ.', link: '/news/maps', type: 'Hot', date: '2026-04-15' },
];

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    getNewsList()
      .then((items) => {
        if (cancelled) return;
        setNewsItems(items);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      })
      .finally(() => {
        window.clearTimeout(timer);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const news =
    newsItems.length > 0
      ? newsItems.map((item) => ({
          title: item.title,
          excerpt: item.excerpt,
          link: newsArticleLink(item.slug),
          type: item.type,
          date: item.publishedAt,
        }))
      : FALLBACK_NEWS;

  const totalPages = Math.max(1, Math.ceil(news.length / ITEMS_PER_PAGE));
  const pageNews = news.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <header className="ns-home-head">
        <h1 className="ns-home-title">Thông báo & cập nhật</h1>
      </header>

      {loading ? (
        <div className="ns-loading">
          <div className="ns-spinner" />
        </div>
      ) : (
        <>
          <div className="ns-news-list">
            {pageNews.map((item, i) => (
              <Link
                key={`${item.link}-${i}`}
                href={item.link}
                className="ns-news-item"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="ns-news-meta">
                  <span className={`ns-badge t-${item.type.toLowerCase()}`}>{item.type}</span>
                  <span className="ns-news-date">{formatNewsDateLong(item.date)}</span>
                </div>
                <h2 className="ns-news-title">{item.title}</h2>
                <p className="ns-news-excerpt">{item.excerpt}</p>
                <span className="ns-news-more">Đọc tiếp →</span>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="ns-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`ns-page-btn${currentPage === page ? ' active' : ''}`}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
