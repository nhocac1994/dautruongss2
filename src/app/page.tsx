'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageBackrow from '@/components/PageBackrow';
import HeroBanner from '@/components/HeroBanner';
import TwoColumnLayout from '@/components/TwoColumnLayout';
import Footer from '@/components/Footer';
import { getNewsList, newsArticleLink, formatNewsDateLong, type NewsArticleListItem } from '@/lib/news-api';

const FALLBACK_NEWS = [
  { title: 'HƯỚNG DẪN CHƠI - SEASON 2.0', excerpt: 'Hướng dẫn chi tiết cách chơi Season 2.0 bản chuẩn (không hạ cấp), từ tạo nhân vật đến các tính năng nâng cao.', link: '/news/guide', type: 'Notice', date: '2026-04-15' },
  { title: 'CÁC SỰ KIỆN TRONG GAME', excerpt: 'Double EXP, Drop Rate Event, PK Tournament và nhiều sự kiện đặc biệt.', link: '/news/events', type: 'Event', date: '2026-04-15' },
  { title: 'LỘ TRÌNH PHÁT TRIỂN SERVER', excerpt: 'Kế hoạch phát triển, tính năng mới và cải thiện trải nghiệm.', link: '/news/roadmap', type: 'Update', date: '2026-04-15' },
  { title: 'THÔNG BÁO MỞ SERVER', excerpt: 'Thông báo chính thức mở cửa server.', link: '/news/opening', type: 'Notice', date: '2026-04-15' },
  { title: 'THÔNG TIN CÁC MAP', excerpt: 'Bảng Zen, PK và tỷ lệ drop ngọc theo từng bản đồ.', link: '/news/maps', type: 'Hot', date: '2026-04-15' },
];

const ITEMS_PER_PAGE = 5;

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getNewsList().then((items) => {
      setNewsItems(items);
      setLoading(false);
    });
  }, []);

  const news = newsItems.length > 0
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
    <div className="we-page">
      <div className="we-home-stage">
        <div className="we-home-backdrop" aria-hidden>
          <PageBackrow />
        </div>
        <HeroBanner />
        <div className="we-home-front">
          <TwoColumnLayout onBackrow>
          {loading ? (
            <div className="we-loading-center"><div className="we-spinner" /></div>
          ) : (
            <>
              {pageNews.map((item, i) => (
                <article key={i} className="we-news-card">
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
              ))}

              {totalPages > 1 && (
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
          </TwoColumnLayout>
        </div>
      </div>

      <Footer />
    </div>
  );
}
