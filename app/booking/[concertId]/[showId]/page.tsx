'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useConcertsStore } from '@/store/concertsStore';
import { useBookingStore } from '@/store/bookingStore';
import { getSeating, postReservation, postBooking } from '@/lib/api';
import { SeatingRow, Concert, Show, Ticket } from '@/lib/types';
import { COUNTRIES } from '@/lib/countries';

interface SelectedSeat { rowId: number; rowName: string; seat: number; }

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const concertId = Number(params.concertId);
  const showId = Number(params.showId);

  const { concerts, loaded, fetchConcerts } = useConcertsStore();
  const { reservationToken, reservedUntil, selectedSeats, setReservation, setSelectedSeats, clearReservation, setTickets } = useBookingStore();

  const [concert, setConcert] = useState<Concert | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [rows, setRows] = useState<SeatingRow[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [unavailableMap, setUnavailableMap] = useState<Map<string, boolean>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name:'', address:'', city:'', zip:'', country:'' });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load concerts if not loaded
  useEffect(() => { if (!loaded) fetchConcerts(); }, [loaded, fetchConcerts]);

  // Find concert/show
  useEffect(() => {
    if (!loaded) return;
    const c = concerts.find(c => c.id === concertId);
    if (c) {
      setConcert(c);
      const s = c.shows.find(s => s.id === showId);
      if (s) setShow(s);
    }
  }, [concerts, loaded, concertId, showId]);

  // Load seating
  useEffect(() => {
    setLoadingSeats(true);
    getSeating(concertId, showId).then(data => {
      setRows(data.rows);
      const map = new Map<string, boolean>();
      for (const row of data.rows) {
        for (const s of row.seats.unavailable) {
          map.set(`${row.id}-${s}`, true);
        }
      }
      setUnavailableMap(map);
      setLoadingSeats(false);
    }).catch(() => setLoadingSeats(false));
  }, [concertId, showId]);

  // Countdown timer
  const startTimer = useCallback((until: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const diff = Math.floor((new Date(until).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timerRef.current!);
        alert('Your seat reservation expired. The reservation has been cancelled.');
        clearReservation();
        setShowForm(false);
        // refresh unavailable
        getSeating(concertId, showId).then(data => {
          setRows(data.rows);
          const map = new Map<string, boolean>();
          for (const row of data.rows) {
            for (const s of row.seats.unavailable) map.set(`${row.id}-${s}`, true);
          }
          setUnavailableMap(map);
        });
      } else {
        setTimeLeft(diff);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, [clearReservation, concertId, showId]);

  useEffect(() => {
    if (reservedUntil && selectedSeats.length > 0) startTimer(reservedUntil);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [reservedUntil, startTimer, selectedSeats.length]);

  const handleSeatClick = async (rowId: number, rowName: string, seat: number) => {
    const key = `${rowId}-${seat}`;
    if (unavailableMap.get(key)) return;

    let newSeats: SelectedSeat[];
    const existing = selectedSeats.find(s => s.rowId === rowId && s.seat === seat);
    if (existing) {
      newSeats = selectedSeats.filter(s => !(s.rowId === rowId && s.seat === seat));
    } else {
      newSeats = [...selectedSeats, { rowId, rowName, seat }];
    }
    setSelectedSeats(newSeats);

    const body: Record<string, unknown> = {
      reservations: newSeats.map(s => ({ row: s.rowId, seat: s.seat })),
    };
    if (reservationToken) body.reservation_token = reservationToken;

    const res = await postReservation(concertId, showId, body);
    if (res.status === 201) {
      setReservation(res.data.reservation_token, res.data.reserved_until);
      if (newSeats.length > 0) startTimer(res.data.reserved_until);
      else { if (timerRef.current) clearInterval(timerRef.current); setTimeLeft(null); }
    }
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const handleBook = async () => {
    const errors: Record<string, boolean> = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.address.trim()) errors.address = true;
    if (!form.city.trim()) errors.city = true;
    if (!form.zip.trim()) errors.zip = true;
    if (!form.country) errors.country = true;
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitting(true);
    const res = await postBooking(concertId, showId, {
      reservation_token: reservationToken,
      ...form,
    });
    setSubmitting(false);
    if (res.status === 201) {
      setTickets(res.data.tickets as Ticket[]);
      clearReservation();
      if (timerRef.current) clearInterval(timerRef.current);
      router.push('/tickets/booked');
    }
  };

  const seatStatus = (rowId: number, seat: number) => {
    if (selectedSeats.find(s => s.rowId === rowId && s.seat === seat)) return 'selected';
    if (unavailableMap.get(`${rowId}-${seat}`)) return 'unavailable';
    return 'available';
  };

  return (
    <>
      <Header />
      <div className="page-title">
        {concert ? `${concert.artist} — ${concert.location.name}` : 'Book your seats'}
        {show && ` · ${formatDate(show.start)}, ${formatTime(show.start)}–${formatTime(show.end)}`}
      </div>
      <div className="main-container">
        <a className="back-link" href="/">← Back to concerts</a>
        {loadingSeats ? (
          <div className="loading">Loading seats...</div>
        ) : (
          <div className="booking-layout">
            {/* LEFT: Seating or Form */}
            <div>
              {!showForm ? (
                <div className="seating-area">
                  <div className="seating-title">Select your seats</div>
                  <div className="stage-label">STAGE</div>
                  {rows.map(row => (
                    <div key={row.id} className="seat-row">
                      <div className="row-name" title={row.name}>{row.name}</div>
                      {Array.from({ length: row.seats.total }, (_, i) => i + 1).map(s => {
                        const status = seatStatus(row.id, s);
                        return (
                          <button
                            key={s}
                            className={`seat-btn ${status}`}
                            onClick={() => handleSeatClick(row.id, row.name, s)}
                            disabled={status === 'unavailable'}
                            title={`Row: ${row.name}, Seat: ${s}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  <div className="seat-legend">
                    <span><span className="legend-dot" style={{background:'var(--seat-available)'}}></span>Available</span>
                    <span><span className="legend-dot" style={{background:'var(--seat-selected)'}}></span>Selected</span>
                    <span><span className="legend-dot" style={{background:'var(--seat-unavailable)'}}></span>Taken</span>
                  </div>
                </div>
              ) : (
                <div className="booking-form">
                  <h2>Your details</h2>
                  {(['name','address','city','zip'] as const).map(field => (
                    <div className="form-group" key={field}>
                      <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input
                        id={field}
                        className={`form-input${formErrors[field] ? ' invalid' : ''}`}
                        value={form[field]}
                        onChange={e => { setForm(f => ({...f, [field]: e.target.value})); setFormErrors(fe => ({...fe, [field]: false})); }}
                      />
                    </div>
                  ))}
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      className={`form-select${formErrors.country ? ' invalid' : ''}`}
                      value={form.country}
                      onChange={e => { setForm(f => ({...f, country: e.target.value})); setFormErrors(fe => ({...fe, country: false})); }}
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button className="btn-primary" onClick={handleBook} disabled={submitting}>
                    {submitting ? 'Booking...' : 'Book'}
                  </button>
                  <button className="btn-secondary" style={{marginTop:'0.5rem'}} onClick={() => setShowForm(false)}>
                    ← Back to seat selection
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="sidebar">
              <div className="selected-seats-box">
                <h3>Selected Seats</h3>
                {selectedSeats.length === 0 ? (
                  <p className="no-seats-text">No seats selected. Click on a seat to make a reservation.</p>
                ) : (
                  selectedSeats.map(s => (
                    <div key={`${s.rowId}-${s.seat}`} className="selected-seat-item">
                      Row: {s.rowName}, Seat: {s.seat}
                    </div>
                  ))
                )}
              </div>

              {timeLeft !== null && selectedSeats.length > 0 && (
                <div className={`timer-box${timeLeft < 60 ? ' expiring' : ''}`}>
                  <div className="timer-label">Reservation expires in</div>
                  <div className="timer-value">{formatTimer(timeLeft)}</div>
                </div>
              )}

              {!showForm && (
                <button
                  className="btn-primary"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setShowForm(true)}
                >
                  Continue to booking →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
