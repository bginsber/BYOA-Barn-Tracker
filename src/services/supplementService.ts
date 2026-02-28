import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Supplement, SupplementFormData } from '../types';

const COLLECTION = 'supplements';

function requireAuth(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
}

export const supplementService = {
  async getSupplements(horseId?: string): Promise<Supplement[]> {
    const userId = requireAuth();
    const constraints = [
      where('userId', '==', userId),
      orderBy('horseName', 'asc'),
      orderBy('name', 'asc'),
    ];
    if (horseId) {
      constraints.unshift(where('horseId', '==', horseId));
    }
    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplement));
  },

  async createSupplement(data: SupplementFormData): Promise<string> {
    const userId = requireAuth();
    const now = Date.now();
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async updateSupplement(id: string, data: Partial<SupplementFormData>): Promise<void> {
    const userId = requireAuth();
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Supplement not found');
    if (snap.data()?.userId !== userId) throw new Error('Not authorized');
    await updateDoc(ref, { ...data, updatedAt: Date.now() });
  },

  async deleteSupplement(id: string): Promise<void> {
    const userId = requireAuth();
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Supplement not found');
    if (snap.data()?.userId !== userId) throw new Error('Not authorized');
    await deleteDoc(ref);
  },

  /** Add stock when a delivery arrives */
  async recordDelivery(id: string, bagsReceived: number): Promise<void> {
    const userId = requireAuth();
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Supplement not found');
    if (snap.data()?.userId !== userId) throw new Error('Not authorized');

    const today = new Date().toISOString().split('T')[0];
    const current = snap.data() as Supplement;

    const updates: Partial<Supplement> = {
      currentStock: current.currentStock + bagsReceived,
      updatedAt: Date.now(),
    };

    if (current.subscription) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + current.subscription.deliveryFrequencyDays);
      updates.subscription = {
        ...current.subscription,
        lastDeliveryDate: today,
        nextDeliveryDate: nextDate.toISOString().split('T')[0],
      };
    }

    await updateDoc(ref, updates);
  },
};
