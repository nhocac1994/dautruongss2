'use client';

import React, { useState, useEffect } from 'react';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, type SiteConfig } from '@/lib/config-api';

const LOGO_VERSION = '20260622';

/** Logo NAME.PNG — căn giữa trên nền banner hero */
export default function HeroBanner() {
  const [config, setConfig] = useState<SiteConfig>(siteConfigStatic as unknown as SiteConfig);

  useEffect(() => {
    getSiteConfig().then((c) => { if (c) setConfig({ ...siteConfigStatic, ...c } as SiteConfig); });
  }, []);

  const serverName = config?.serverName || config?.nameGame || 'SEASON2';
  const logoSrc = `/NAME.PNG?v=${LOGO_VERSION}`;

  return (
    <div className="we-home-hero-logo-wrap">
      <img
        src={logoSrc}
        alt={serverName}
        className="we-home-hero-logo"
        width={320}
        height={320}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
