const BASE = 'http://apic.polytech.edu.kz/api/v1';

export async function getConcerts() {
  const res = await fetch(`${BASE}/concerts`);
  if (!res.ok) throw new Error('Failed to fetch concerts');
  return res.json();
}

export async function getSeating(concertId: number, showId: number) {
  const res = await fetch(`${BASE}/concerts/${concertId}/shows/${showId}/seating`);
  if (!res.ok) throw new Error('Failed to fetch seating');
  return res.json();
}

export async function postReservation(concertId: number, showId: number, body: object) {
  const res = await fetch(`${BASE}/concerts/${concertId}/shows/${showId}/reservation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

export async function postBooking(concertId: number, showId: number, body: object) {
  const res = await fetch(`${BASE}/concerts/${concertId}/shows/${showId}/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

export async function postGetTickets(body: { code: string; name: string }) {
  const res = await fetch(`${BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

export async function cancelTicket(ticketId: number, body: { code: string; name: string }) {
  const res = await fetch(`${BASE}/tickets/${ticketId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status };
}
