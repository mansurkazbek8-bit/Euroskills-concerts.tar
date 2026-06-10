'use client';
import { Concert, Show } from '@/lib/types';

interface ShowCardProps {
  concert: Concert;
  show: Show;
  onClick: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

export default function ShowCard({ concert, show, onClick }: ShowCardProps) {
  return (
    <div className="show-card" onClick={onClick}>
      <div className="show-date">{formatDate(show.start)}</div>
      <div className="show-artist">{concert.artist}</div>
      <div className="show-location">📍 {concert.location.name}</div>
      <div className="show-time">
        {formatTime(show.start)} – {formatTime(show.end)}
      </div>
    </div>
  );
}
