/** Nền tối + bóng sáng tím chuyển động (kiểu trang AI) — phủ toàn site */
export default function AmbientGlow() {
  return (
    <div className="we-ambient" aria-hidden>
      <div className="we-ambient-base" />
      <div className="we-ambient-blob we-ambient-blob--a" />
      <div className="we-ambient-blob we-ambient-blob--b" />
      <div className="we-ambient-blob we-ambient-blob--c" />
      <div className="we-ambient-blob we-ambient-blob--d" />
      <div className="we-ambient-veil" />
    </div>
  );
}
