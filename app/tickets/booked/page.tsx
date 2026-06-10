'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useBookingStore } from '@/store/bookingStore';
import TicketsList from '@/components/TicketsList';

export default function BookedTicketsPage() {
  const router = useRouter();
  const { tickets } = useBookingStore();

  useEffect(() => {
    if (!tickets || tickets.length === 0) router.replace('/');
  }, [tickets, router]);

  if (!tickets) return null;

  return (
    <>
      <Header />
      <div className="tickets-page">
        <div className="page-title" style={{padding:'1.5rem 0 1rem'}}>Your Tickets are ready!</div>
        <TicketsList tickets={tickets} onAllCancelled={() => router.push('/')} />
      </div>
    </>
  );
}
