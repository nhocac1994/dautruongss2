'use client';

import React from 'react';

const BG_VERSION = '4';

/** Ảnh nền chung — WebP nhẹ (~160KB), tránh PNG 13MB gây giật khi cuộn */
export default function PageBackrow() {
  return (
    <div className="we-page-backrow" aria-hidden>
      <img
        src={`/panel/muss2.webp?v=${BG_VERSION}`}
        alt=""
        className="we-page-backrow-img"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
