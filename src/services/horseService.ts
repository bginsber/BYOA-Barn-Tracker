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
import { Horse, HorseFormData } from '../types';

const COLLECTION = 'horses';

function requireAuth(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
}

export const horseService = {
  async getHorses(): Promise<Horse[]> {
    const userId = requireAuth();
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Horse));
  },

  async createHorse(data: HorseFormData): Promise<string> {
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

  async updateHorse(id: string, data: Partial<HorseFormData>): Promise<void> {
    const userId = requireAuth();
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Horse not found');
    if (snap.data()?.userId !== userId) throw new Error('Not authorized');
    await updateDoc(ref, { ...data, updatedAt: Date.now() });
  },

  async deleteHorse(id: string): Promise<void> {
    const userId = requireAuth();
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Horse not found');
    if (snap.data()?.userId !== userId) throw new Error('Not authorized');
    await deleteDoc(ref);
  },
};
