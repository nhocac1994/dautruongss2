/** Nền tối + ánh tím tĩnh (không blur/animation nặng — tránh giật khi cuộn) */
export default function AmbientGlow() {
  return (
    <div className="we-ambient" aria-hidden>
      <div className="we-ambient-base" />
      <div className="we-ambient-glow we-ambient-glow--tl" />
      <div className="we-ambient-glow we-ambient-glow--tr" />
      <div className="we-ambient-glow we-ambient-glow--bl" />
    </div>
  );
}
