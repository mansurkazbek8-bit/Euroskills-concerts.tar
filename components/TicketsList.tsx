'use client';
import { useState } from 'react';
import { Ticket } from '@/lib/types';
import { cancelTicket } from '@/lib/api';
import { useBookingStore } from '@/store/bookingStore';

interface Props {
  tickets: Ticket[];
  name?: string;
  onAllCancelled: () => void;
  onUpdate?: (tickets: Ticket[]) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

export default function TicketsList({ tickets: initialTickets, name, onAllCancelled, onUpdate }: Props) {
  const [tickets, setTickets] = useState(initialTickets);
  const { setTickets: setStoreTickets } = useBookingStore();

  const handleCancel = async (ticket: Ticket) => {
    const confirmed = confirm(`Cancel ticket ${ticket.code} for Row ${ticket.row.name}, Seat ${ticket.seat}?`);
    if (!confirmed) return;
    const cancelName = name || ticket.name;
    const res = await cancelTicket(ticket.id, { code: ticket.code, name: cancelName });
    if (res.status === 204) {
      const updated = tickets.filter(t => t.id !== ticket.id);
      setTickets(updated);
      setStoreTickets(updated);
      if (onUpdate) onUpdate(updated);
      if (updated.length === 0) onAllCancelled();
    }
  };

  const bookedOn = tickets.length > 0 ? formatDate(tickets[0].created_at) : '';
  const ticketName = tickets.length > 0 ? tickets[0].name : '';

  return (
    <>
      <div className="booking-info">
        <h3>Booking Details</h3>
        <div style={{fontSize:'0.9rem'}}><strong>Name:</strong> {ticketName}</div>
        <div style={{fontSize:'0.9rem', marginTop:'0.25rem'}}><strong>Booked On:</strong> {bookedOn}</div>
      </div>

      {tickets.map(ticket => (
        <div key={ticket.id} className="ticket-card">
          <div className="ticket-code">{ticket.code}</div>
          <div className="ticket-detail"><strong>Row:</strong> {ticket.row.name} &nbsp;|&nbsp; <strong>Seat:</strong> {ticket.seat}</div>
          <div className="ticket-detail"><strong>Artist:</strong> {ticket.show.concert.artist}</div>
          <div className="ticket-detail"><strong>Venue:</strong> {ticket.show.concert.location.name}</div>
          <div className="ticket-detail">
            <strong>Time:</strong> {formatTime(ticket.show.start)} – {formatTime(ticket.show.end)}
          </div>
          <button className="btn-cancel" onClick={() => handleCancel(ticket)}>
            Cancel ticket
          </button>
        </div>
      ))}
    </>
  );
}
