import { useState, useCallback } from 'react';
import { horseService } from '../services/horseService';
import { Horse, HorseFormData } from '../types';

interface UseHorsesResult {
  horses: Horse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createHorse: (data: HorseFormData) => Promise<string>;
  updateHorse: (id: string, data: Partial<HorseFormData>) => Promise<void>;
  deleteHorse: (id: string) => Promise<void>;
}

export function useHorses(): UseHorsesResult {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await horseService.getHorses();
      setHorses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load horses');
    } finally {
      setLoading(false);
    }
  }, []);

  const createHorse = useCallback(async (data: HorseFormData): Promise<string> => {
    const id = await horseService.createHorse(data);
    await refresh();
    return id;
  }, [refresh]);

  const updateHorse = useCallback(async (id: string, data: Partial<HorseFormData>): Promise<void> => {
    await horseService.updateHorse(id, data);
    await refresh();
  }, [refresh]);

  const deleteHorse = useCallback(async (id: string): Promise<void> => {
    await horseService.deleteHorse(id);
    setHorses((prev: Horse[]) => prev.filter((h: Horse) => h.id !== id));
  }, []);

  return { horses, loading, error, refresh, createHorse, updateHorse, deleteHorse };
}
