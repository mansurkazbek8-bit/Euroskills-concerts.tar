import { create } from 'zustand';
import { Ticket } from '@/lib/types';

interface SelectedSeat {
  rowId: number;
  rowName: string;
  seat: number;
}

interface BookingState {
  reservationToken: string | null;
  reservedUntil: string | null;
  selectedSeats: SelectedSeat[];
  tickets: Ticket[] | null;
  setReservation: (token: string, until: string) => void;
  setSelectedSeats: (seats: SelectedSeat[]) => void;
  setTickets: (tickets: Ticket[]) => void;
  clearReservation: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  reservationToken: null,
  reservedUntil: null,
  selectedSeats: [],
  tickets: null,
  setReservation: (token, until) => set({ reservationToken: token, reservedUntil: until }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  setTickets: (tickets) => set({ tickets }),
  clearReservation: () => set({ reservationToken: null, reservedUntil: null, selectedSeats: [] }),
}));
