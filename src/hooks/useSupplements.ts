import { useState, useCallback } from 'react';
import { supplementService } from '../services/supplementService';
import { Supplement, SupplementFormData } from '../types';

interface UseSupplementsResult {
  supplements: Supplement[];
  loading: boolean;
  error: string | null;
  refresh: (horseId?: string) => Promise<void>;
  createSupplement: (data: SupplementFormData) => Promise<string>;
  updateSupplement: (id: string, data: Partial<SupplementFormData>) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;
  recordDelivery: (id: string, quantity: number) => Promise<void>;
}

export function useSupplements(horseId?: string): UseSupplementsResult {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (filterHorseId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplementService.getSupplements(filterHorseId ?? horseId);
      setSupplements(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load supplements');
    } finally {
      setLoading(false);
    }
  }, [horseId]);

  const createSupplement = useCallback(async (data: SupplementFormData): Promise<string> => {
    const id = await supplementService.createSupplement(data);
    await refresh();
    return id;
  }, [refresh]);

  const updateSupplement = useCallback(async (id: string, data: Partial<SupplementFormData>): Promise<void> => {
    await supplementService.updateSupplement(id, data);
    await refresh();
  }, [refresh]);

  const deleteSupplement = useCallback(async (id: string): Promise<void> => {
    await supplementService.deleteSupplement(id);
    setSupplements((prev: Supplement[]) => prev.filter((s: Supplement) => s.id !== id));
  }, []);

  const recordDelivery = useCallback(async (id: string, quantity: number): Promise<void> => {
    await supplementService.recordDelivery(id, quantity);
    await refresh();
  }, [refresh]);

  return {
    supplements,
    loading,
    error,
    refresh,
    createSupplement,
    updateSupplement,
    deleteSupplement,
    recordDelivery,
  };
}
