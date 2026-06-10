import { create } from 'zustand';
import { Concert } from '@/lib/types';
import { getConcerts } from '@/lib/api';

interface ConcertsState {
  concerts: Concert[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchConcerts: () => Promise<void>;
}

export const useConcertsStore = create<ConcertsState>((set, get) => ({
  concerts: [],
  loaded: false,
  loading: false,
  error: null,
  fetchConcerts: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      const data = await getConcerts();
      set({ concerts: data.concerts, loaded: true, loading: false });
    } catch {
      set({ error: 'Failed to load concerts', loading: false });
    }
  },
}));
