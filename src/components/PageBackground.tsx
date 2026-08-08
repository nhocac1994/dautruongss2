'use client';

type PageBackgroundProps = {
  /** Trang chủ: nền tím gradient kiểu SSeMU */
  variant?: 'default' | 'purple';
};

export default function PageBackground({ variant = 'default' }: PageBackgroundProps) {
  if (variant === 'purple') {
    return (
      <div
        className="page-bg-layer fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 65% at 70% 18%, rgba(147, 51, 234, 0.28) 0%, transparent 58%),
            radial-gradient(ellipse 65% 55% at 15% 75%, rgba(124, 58, 237, 0.2) 0%, transparent 52%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(88, 28, 135, 0.12) 0%, transparent 70%),
            linear-gradient(180deg, #120818 0%, #0f0618 45%, #0a0510 100%)
          `,
        }}
      />
    );
  }

  return (
    <div
      className="page-bg-layer fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/panel/muss2.webp)',
        /* Không dùng CSS filter trên ảnh full-viewport — gây giật khi cuộn */
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
    </div>
  );
}
