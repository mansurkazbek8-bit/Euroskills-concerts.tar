export interface Location {
  id: number;
  name: string;
}

export interface Show {
  id: number;
  start: string;
  end: string;
}

export interface Concert {
  id: number;
  artist: string;
  location: Location;
  shows: Show[];
}

export interface ConcertsResponse {
  concerts: Concert[];
}

export interface SeatingRow {
  id: number;
  name: string;
  seats: {
    total: number;
    unavailable: number[];
  };
}

export interface SeatingResponse {
  rows: SeatingRow[];
}

export interface ReservationRequest {
  reservation_token?: string;
  reservations: { row: number; seat: number }[];
  duration?: number;
}

export interface ReservationResponse {
  reserved: boolean;
  reservation_token: string;
  reserved_until: string;
}

export interface BookingRequest {
  reservation_token: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface TicketRow {
  id: number;
  name: string;
}

export interface TicketShow {
  id: number;
  start: string;
  end: string;
  concert: {
    id: number;
    artist: string;
    location: Location;
  };
}

export interface Ticket {
  id: number;
  code: string;
  name: string;
  created_at: string;
  row: TicketRow;
  seat: number;
  show: TicketShow;
}

export interface TicketsResponse {
  tickets: Ticket[];
}
