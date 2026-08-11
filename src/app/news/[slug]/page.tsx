'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SubPageLayout from '@/components/SubPageLayout';
import { getNewsArticle, formatNewsDateLong } from '@/lib/news-api';
import { renderArticleContent } from '@/lib/simple-markdown';
import { newsBadgeClass } from '@/lib/page-theme';

export default function NewsArticlePage() {
  const params = useParams();
  const slug = String(params.slug || '');
  const [article, setArticle] = useState<Awaited<ReturnType<typeof getNewsArticle>>>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getNewsArticle(slug).then((data) => {
      if (data) setArticle(data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  return (
    <SubPageLayout>
      <Link href="/" className="ns-article-back">
        ← Quay lại bản tin
      </Link>

      {loading && (
        <div className="ns-loading">
          <div className="ns-spinner" />
        </div>
      )}

      {notFound && !loading && (
        <div className="ns-article ns-article--empty">
          <p>Không tìm thấy bài viết.</p>
          <Link href="/" className="ns-article-back">
            ← Quay lại bản tin
          </Link>
        </div>
      )}

      {article && (
        <article className="ns-article">
          <header className="ns-article-head">
            <div className="ns-news-meta">
              <span className={newsBadgeClass(article.type)}>{article.type}</span>
              <time className="ns-news-date" dateTime={article.publishedAt}>
                {formatNewsDateLong(article.publishedAt)}
              </time>
            </div>
            <h1 className="ns-article-title">{article.title}</h1>
          </header>

          <div
            className="ns-article-body"
            dangerouslySetInnerHTML={{
              __html: renderArticleContent(article.content, article.contentFormat),
            }}
          />

          <footer className="ns-article-foot">
            <Link href="/" className="ns-article-cta">
              ← Xem tất cả bản tin
            </Link>
          </footer>
        </article>
      )}
    </SubPageLayout>
  );
}
