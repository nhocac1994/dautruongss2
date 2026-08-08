'use client';

import React, { useState } from 'react';
import { getMuClassIcon, getMuClassShort, getMuClassName } from '@/lib/mu-classes';

type ClassIconProps = {
  classId: number;
  size?: number;
  className?: string;
};

/** Hiển thị icon class (dw/dk/ef/mg/dl.png). Không có icon / 404 thì dùng badge chữ. */
export default function ClassIcon({ classId, size = 24, className }: ClassIconProps) {
  const icon = getMuClassIcon(classId);
  const short = getMuClassShort(classId);
  const title = getMuClassName(classId);
  const [imgFailed, setImgFailed] = useState(false);

  if (icon && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt={short}
        title={title}
        className={`we-class-icon${className ? ` ${className}` : ''}`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <span className={`we-class-badge${className ? ` ${className}` : ''}`} title={title}>
      {short}
    </span>
  );
}
