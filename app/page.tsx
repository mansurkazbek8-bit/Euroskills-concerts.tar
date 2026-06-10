'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ShowCard from '@/components/ShowCard';
import { useConcertsStore } from '@/store/concertsStore';
import { Concert, Show } from '@/lib/types';

interface FlatShow {
  concert: Concert;
  show: Show;
  dateStr: string;
}

export default function HomePage() {
  const router = useRouter();
  const { concerts, loaded, loading, error, fetchConcerts } = useConcertsStore();

  const [filterLocation, setFilterLocation] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { fetchConcerts(); }, [fetchConcerts]);

  const flatShows = useMemo((): FlatShow[] => {
    const result: FlatShow[] = [];
    for (const concert of concerts) {
      for (const show of concert.shows) {
        result.push({
          concert,
          show,
          dateStr: show.start.slice(0, 10),
        });
      }
    }
    return result;
  }, [concerts]);

  const locations = useMemo(() => {
    const set = new Set(concerts.map(c => c.location.name));
    return Array.from(set).sort();
  }, [concerts]);

  const artists = useMemo(() => {
    const active = new Set(concerts.filter(c => c.shows.length > 0).map(c => c.artist));
    return Array.from(active).sort();
  }, [concerts]);

  const filtered = useMemo(() => {
    return flatShows.filter(({ concert, dateStr }) => {
      if (filterLocation && concert.location.name !== filterLocation) return false;
      if (filterArtist && concert.artist !== filterArtist) return false;
      if (filterDate && dateStr !== filterDate) return false;
      return true;
    });
  }, [flatShows, filterLocation, filterArtist, filterDate]);

  const hasFilter = filterLocation || filterArtist || filterDate;

  const clearFilters = () => {
    setFilterLocation('');
    setFilterArtist('');
    setFilterDate('');
  };

  return (
    <>
      <Header />
      <div className="page-title">Checkout these amazing concerts in Graz.</div>
      <div className="main-container">
        <div className="filters">
          <select className="filter-select" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
            <option value="">All locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="filter-select" value={filterArtist} onChange={e => setFilterArtist(e.target.value)}>
            <option value="">All Artists</option>
            {artists.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            type="date"
            className="filter-date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
          {hasFilter && (
            <button className="btn-clear" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>

        {loading && <div className="loading">Loading concerts...</div>}
        {error && <div className="loading" style={{ color: 'var(--error)' }}>{error}</div>}

        {!loading && !error && (
          <>
            {filtered.length === 0 && loaded && (
              <div className="no-shows">
                No shows are matching the current filter criteria.
              </div>
            )}
            <div className="shows-grid">
              {filtered.map(({ concert, show }) => (
                <ShowCard
                  key={`${concert.id}-${show.id}`}
                  concert={concert}
                  show={show}
                  onClick={() => router.push(`/booking/${concert.id}/${show.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
