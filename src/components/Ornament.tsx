export function Ornament({ className = 'h-5 w-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 20" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M2 10h32M62 10h32" />
      <path d="M48 2l6 8-6 8-6-8z" />
      <circle cx="38" cy="10" r="1.5" fill="currentColor" />
      <circle cx="58" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
