import { useState, useCallback } from 'react';
import { shavingsService } from '../services/shavingsService';
import { ShavingsInventory, ShavingsDelivery } from '../types';

interface UseShavingsResult {
  inventory: ShavingsInventory | null;
  deliveries: ShavingsDelivery[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsertInventory: (data: Partial<Omit<ShavingsInventory, 'id' | 'userId' | 'lastUpdated'>>) => Promise<void>;
  recordDelivery: (bags: number, date: string, supplier?: string, notes?: string) => Promise<void>;
  markOrderPlaced: (expectedDate?: string) => Promise<void>;
}

export function useShavings(): UseShavingsResult {
  const [inventory, setInventory] = useState<ShavingsInventory | null>(null);
  const [deliveries, setDeliveries] = useState<ShavingsDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, hist] = await Promise.all([
        shavingsService.getInventory(),
        shavingsService.getDeliveryHistory(),
      ]);
      setInventory(inv);
      setDeliveries(hist);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load shavings data');
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertInventory = useCallback(
    async (data: Partial<Omit<ShavingsInventory, 'id' | 'userId' | 'lastUpdated'>>) => {
      await shavingsService.upsertInventory(data);
      await refresh();
    },
    [refresh]
  );

  const recordDelivery = useCallback(
    async (bags: number, date: string, supplier?: string, notes?: string) => {
      await shavingsService.recordDelivery(bags, date, supplier, notes);
      await refresh();
    },
    [refresh]
  );

  const markOrderPlaced = useCallback(async (expectedDate?: string) => {
    await shavingsService.markOrderPlaced(expectedDate);
    await refresh();
  }, [refresh]);

  return {
    inventory,
    deliveries,
    loading,
    error,
    refresh,
    upsertInventory,
    recordDelivery,
    markOrderPlaced,
  };
}
