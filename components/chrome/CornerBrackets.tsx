export default function CornerBrackets() {
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-20 h-12 w-12 border-l border-t border-white/20" />
      <div className="pointer-events-none absolute right-4 top-4 z-20 h-12 w-12 border-r border-t border-white/20" />
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 h-12 w-12 border-b border-l border-white/20" />
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 h-12 w-12 border-b border-r border-white/20" />
    </>
  );
}