'use client';

import React, { useState, useEffect } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, getDownloadConfig, type SiteConfig, type DownloadLinks } from '@/lib/config-api';

const VC_REDIST_URL = 'https://aka.ms/vs/17/release/vc_redist.x64.exe';

export default function DownloadPage() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLinks | null>(null);

  useEffect(() => {
    getSiteConfig().then((c) => { if (c) setSiteConfig({ ...siteConfigStatic, ...c } as SiteConfig); });
    getDownloadConfig().then((l) => { if (l) setDownloadLinks(l); });
  }, []);

  const config = siteConfig;
  const links = downloadLinks || config?.downloadLinks;
  const clientVersion = links?.clientVersion || 'Season 1.0';
  const serverName = config?.serverName || config?.nameGame || 'MUDAUTRUONGSS1.NET';
  const displayName = serverName.replace(/\.(net|com|vn|org)$/i, '');

  return (
    <div className="we-page">
      <SubPageLayout title="Tải Game">
        <div className="we-box">
          <div className="we-box-head">Bản cài đặt Game</div>
          <div className="we-box-body" style={{ padding: 0 }}>
            <div className="we-download-row">
              <div className="we-download-info">
                <h4>Bản cài đặt Full {displayName} {clientVersion}</h4>
                <p>Client {displayName}</p>
              </div>
              <span className="we-download-size">397 MB</span>
              <a
                href={links?.mediafire || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="we-btn we-btn-download"
              >
                Tải về
              </a>
            </div>
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

        <div className="we-box">
          <div className="we-box-head">Thư viện hỗ trợ</div>
          <div className="we-box-body" style={{ padding: 0 }}>
            <div className="we-download-row">
              <div className="we-download-info">
                <h4>Microsoft Visual C++ 2015–2022</h4>
                <p>Cài nếu thiếu thư viện C++ khi mở game (x64)</p>
              </div>
              <a
                href={VC_REDIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="we-btn we-btn-download"
              >
                Tải về
              </a>
            </div>
          </div>
        </div>
      </SubPageLayout>
    </div>
  );
}
