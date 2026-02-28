import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { ShavingsInventory, ShavingsDelivery } from '../types';

function requireAuth(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
}

export const shavingsService = {
  async getInventory(): Promise<ShavingsInventory | null> {
    const userId = requireAuth();
    const ref = doc(db, 'shavings', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ShavingsInventory;
  },

  async upsertInventory(data: Partial<Omit<ShavingsInventory, 'id' | 'userId' | 'lastUpdated'>>): Promise<void> {
    const userId = requireAuth();
    const ref = doc(db, 'shavings', userId);
    await setDoc(
      ref,
      { ...data, userId, lastUpdated: Date.now() },
      { merge: true }
    );
  },

  async recordDelivery(
    bagsReceived: number,
    deliveredAt: string,
    supplier?: string,
    notes?: string
  ): Promise<void> {
    const userId = requireAuth();

    // Update inventory count
    const invRef = doc(db, 'shavings', userId);
    const invSnap = await getDoc(invRef);
    const current = invSnap.exists() ? (invSnap.data() as ShavingsInventory) : null;
    const currentBags = current?.currentBags ?? 0;

    await setDoc(
      invRef,
      {
        currentBags: currentBags + bagsReceived,
        pendingOrderDate: null,
        expectedDeliveryDate: null,
        lastUpdated: Date.now(),
        userId,
      },
      { merge: true }
    );

    // Record delivery history
    const delivery: Omit<ShavingsDelivery, 'id'> = {
      bagsReceived,
      deliveredAt,
      supplier: supplier ?? current?.supplier,
      notes,
      createdAt: Date.now(),
    };
    await addDoc(collection(db, 'shavings', userId, 'deliveries'), delivery);
  },

  async markOrderPlaced(expectedDeliveryDate?: string): Promise<void> {
    const userId = requireAuth();
    const today = new Date().toISOString().split('T')[0];
    await setDoc(
      doc(db, 'shavings', userId),
      {
        pendingOrderDate: today,
        expectedDeliveryDate: expectedDeliveryDate ?? null,
        lastUpdated: Date.now(),
        userId,
      },
      { merge: true }
    );
  },

  async getDeliveryHistory(count = 10): Promise<ShavingsDelivery[]> {
    const userId = requireAuth();
    const q = query(
      collection(db, 'shavings', userId, 'deliveries'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ShavingsDelivery));
  },
};
