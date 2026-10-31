export default function Flame({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="flame">
      <path d="M12 2c1 3.5 5 5.8 5 10.5A5 5 0 0 1 12 18a5 5 0 0 1-5-5.5c0-2 1-3.4 2-4.5.2 1.6 1 2.6 2 3 0-3.4.6-6.4 1-9Z" fill="#fbbf24" />
      <path d="M12 10c.6 1.8 2.6 2.9 2.6 5.2A2.6 2.6 0 0 1 12 18a2.6 2.6 0 0 1-2.6-2.8c0-1.4.9-2.2 1.6-2.9.1.7.5 1.2 1 1.4 0-1.6 0-2.6 0-3.7Z" fill="#a3e635" />
    </svg>
  );
}
