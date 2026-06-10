'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { postGetTickets } from '@/lib/api';
import { Ticket } from '@/lib/types';
import TicketsList from '@/components/TicketsList';

export default function TicketsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!code.trim()) errs.code = 'Ticket code is required.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    const res = await postGetTickets({ name: name.trim(), code: code.trim() });
    setLoading(false);
    if (res.status === 200) {
      setTickets(res.data.tickets);
    } else {
      setApiError('Could not find tickets with these details.');
    }
  };

  return (
    <>
      <Header />
      <div className="tickets-page">
        {!tickets ? (
          <>
            <div className="page-title" style={{padding:'1.5rem 0 1rem'}}>Retrieve your tickets.</div>
            <div className="retrieve-form">
              <div className="form-group">
                <label htmlFor="r-name">Name</label>
                <input
                  id="r-name"
                  className={`form-input${errors.name ? ' invalid' : ''}`}
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(er => ({...er, name:''})); }}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="r-code">Ticket code</label>
                <input
                  id="r-code"
                  className={`form-input${errors.code ? ' invalid' : ''}`}
                  value={code}
                  onChange={e => { setCode(e.target.value); setErrors(er => ({...er, code:''})); }}
                />
                {errors.code && <div className="form-error">{errors.code}</div>}
              </div>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Searching...' : 'Get Tickets'}
              </button>
              {apiError && <div className="error-msg">{apiError}</div>}
            </div>
          </>
        ) : (
          <>
            <div className="page-title" style={{padding:'1.5rem 0 1rem'}}>Your Tickets are ready!</div>
            <TicketsList
              tickets={tickets}
              name={name}
              onAllCancelled={() => router.push('/')}
              onUpdate={setTickets}
            />
          </>
        )}
      </div>
    </>
  );
}
