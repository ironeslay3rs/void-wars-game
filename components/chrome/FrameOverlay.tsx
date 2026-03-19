export default function FrameOverlay() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_140px_rgba(0,0,0,0.92)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="pointer-events-none absolute left-6 right-6 top-6 z-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="pointer-events-none absolute left-6 right-6 bottom-6 z-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </>
  );
}