'use client';

import React, { useState, useEffect } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, getDownloadConfig, type SiteConfig, type DownloadLinks } from '@/lib/config-api';

export default function DownloadPage() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLinks | null>(null);

  useEffect(() => {
    getSiteConfig().then((c) => { if (c) setSiteConfig({ ...siteConfigStatic, ...c } as SiteConfig); });
    getDownloadConfig().then((l) => { if (l) setDownloadLinks(l); });
  }, []);

  const config = siteConfig;
  const links = downloadLinks || config?.downloadLinks;
  const clientVersion = links?.clientVersion || 'Season 2.0';
  const serverName = config?.serverName || config?.nameGame || 'SEASON2';
  const displayName = serverName.replace(/\.(net|com|vn|org)$/i, '');

  const downloads = [
    {
      title: `Bản cài đặt Full ${displayName} ${clientVersion}`,
      subtitle: `Client ${displayName}`,
      size: '397 MB',
      href: links?.mediafire || '#',
    },
    {
      title: 'Phần mềm hỗ trợ UltraViewer',
      subtitle: 'Hỗ trợ cài đặt game',
      size: '4 MB',
      href: 'https://www.ultraviewer.net/vi/download.html',
    },
    {
      title: 'Phần mềm hỗ trợ giải nén file',
      subtitle: 'WinRAR / 7-Zip',
      size: '4 MB',
      href: 'https://www.7-zip.org/download.html',
    },
  ];

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: 'Tải Game' }]} title="Tải Game">
        <div className="we-box">
          <div className="we-box-head">Bản cài đặt Game</div>
          <div className="we-box-body" style={{ padding: 0 }}>
            {downloads.slice(0, 1).map((item, i) => (
              <div key={i} className="we-download-row">
                <div className="we-download-info">
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>
                <span className="we-download-size">{item.size}</span>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="we-btn we-btn-download">
                  Tải về
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="we-box">
          <div className="we-box-head">Phần mềm hỗ trợ</div>
          <div className="we-box-body" style={{ padding: 0 }}>
            {downloads.slice(1).map((item, i) => (
              <div key={i} className="we-download-row">
                <div className="we-download-info">
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>
                <span className="we-download-size">{item.size}</span>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="we-btn we-btn-download">
                  Tải về
                </a>
              </div>
            ))}
          </div>
        </div>

        {links?.mega && (
          <div className="we-box">
            <div className="we-box-head">Link tải thay thế (Mega)</div>
            <div className="we-box-body" style={{ padding: 0 }}>
              <div className="we-download-row">
                <div className="we-download-info">
                  <h4>{displayName} {clientVersion} — Mega</h4>
                  <p>Link tải dự phòng</p>
                </div>
                <a href={links.mega} target="_blank" rel="noopener noreferrer" className="we-btn we-btn-download">
                  Tải về
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="we-box we-provider-box">
          <div className="we-box-head">Nhà cung cấp File Game</div>
          <div className="we-box-body">
            <p className="we-provider-text">
              File client Mu Online được cung cấp bởi{' '}
              <a
                href="https://www.mumges.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="we-provider-link"
              >
                MUMGES.org
              </a>
              {' '}— file server chuẩn.
            </p>
            <a
              href="https://www.mumges.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="we-btn we-btn-download"
            >
              Truy cập mumges.org
            </a>
          </div>
        </div>
      </SubPageLayout>
      <Footer />
    </div>
  );
}
