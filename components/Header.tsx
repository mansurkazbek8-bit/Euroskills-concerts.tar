'use client';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  return (
    <header className="app-header">
      <h1 onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
        EuroSkills Concerts
      </h1>
      <div className="get-tickets-area">
        <span className="hint-text">Already booked?</span>
        <button className="btn-tickets" onClick={() => router.push('/tickets')}>
          Get Tickets
        </button>
      </div>
    </header>
  );
}
