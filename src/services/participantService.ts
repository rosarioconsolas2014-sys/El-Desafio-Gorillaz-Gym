import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Participant, GameSettings } from '../types';
import { getGameSettings } from './settingsService';

const PARTICIPANTS_COLLECTION = 'participants';
const LOCAL_PARTICIPANTS_KEY = 'gorillaz_firestore_participants_local';

export function validateDNI(dni: string): { isValid: boolean; error?: string } {
  const cleanDni = dni.trim();
  if (!cleanDni) {
    return { isValid: false, error: 'El DNI es obligatorio.' };
  }
  if (!/^\d+$/.test(cleanDni)) {
    return { isValid: false, error: 'El DNI debe contener únicamente números.' };
  }
  if (cleanDni.length < 7 || cleanDni.length > 8) {
    return { isValid: false, error: 'El DNI debe tener entre 7 y 8 dígitos.' };
  }
  return { isValid: true };
}

export function calculateRemainingAttempts(
  participant: Participant,
  settings: GameSettings
): {
  canPlay: boolean;
  remainingText: string;
  remainingCount: number;
} {
  if (!participant.active) {
    return {
      canPlay: false,
      remainingText: 'TU USUARIO HA SIDO SUSPENDIDO POR LA ADMINISTRACIÓN.',
      remainingCount: 0
    };
  }

  if (settings.unlimitedAttempts) {
    return {
      canPlay: true,
      remainingText: 'INTENTOS ILIMITADOS DISPONIBLES',
      remainingCount: Infinity
    };
  }

  const remaining = Math.max(0, settings.maxAttempts - (participant.attemptsUsed || 0));
  const canPlay = remaining > 0;

  let remainingText = '';
  if (canPlay) {
    remainingText = remaining === 1 ? 'TE QUEDA 1 INTENTO' : `TE QUEDAN ${remaining} INTENTOS`;
  } else {
    remainingText = 'YA UTILIZASTE TODOS TUS INTENTOS';
  }

  return {
    canPlay,
    remainingText,
    remainingCount: remaining
  };
}

export async function getParticipantByDni(dni: string): Promise<Participant | null> {
  const cleanDni = dni.trim();
  const val = validateDNI(cleanDni);
  if (!val.isValid) throw new Error(val.error);

  try {
    const q = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where('dni', '==', cleanDni)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Participant;
    }
    return null;
  } catch (error) {
    console.warn('Firestore query failed, checking local participants fallback:', error);
    const local = getLocalParticipants();
    const found = local.find((p) => p.dni === cleanDni);
    return found || null;
  }
}

export async function registerOrGetParticipant(
  name: string,
  dni: string,
  nickname?: string
): Promise<{ participant: Participant; isNew: boolean }> {
  const cleanDni = dni.trim();
  const cleanName = name.trim();
  const valDni = validateDNI(cleanDni);
  if (!valDni.isValid) throw new Error(valDni.error);

  if (cleanName.length < 3) {
    throw new Error('El nombre y apellido debe tener al menos 3 caracteres.');
  }

  // 1. Check if participant already exists by DNI
  const existing = await getParticipantByDni(cleanDni);

  if (existing) {
    // Update name or nickname if changed
    const updates: Partial<Participant> = {};
    if (cleanName && cleanName !== existing.name) updates.name = cleanName;
    if (nickname !== undefined && nickname !== existing.nickname) updates.nickname = nickname;

    if (Object.keys(updates).length > 0) {
      try {
        const docRef = doc(db, PARTICIPANTS_COLLECTION, existing.id);
        await updateDoc(docRef, updates);
      } catch (err) {
        console.warn('Could not update participant doc:', err);
      }
      Object.assign(existing, updates);
    }

    return { participant: existing, isNew: false };
  }

  // 2. Create new participant
  const docId = 'part_' + cleanDni;
  const newParticipant: Participant = {
    id: docId,
    name: cleanName,
    dni: cleanDni,
    nickname: nickname ? nickname.trim() : '',
    attemptsUsed: 0,
    bestScore: 0,
    lastScore: 0,
    bestTimeSeconds: 0,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    active: true
  };

  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, docId);
    await setDoc(docRef, newParticipant);
  } catch (error) {
    console.warn('Could not save participant to Firestore, saving locally:', error);
  }

  saveLocalParticipant(newParticipant);
  return { participant: newParticipant, isNew: true };
}

export async function getAllParticipants(): Promise<Participant[]> {
  try {
    const snap = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
    const list: Participant[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Participant);
    });
    // Sync with local cache
    if (list.length > 0) {
      localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(list));
      return list;
    }
  } catch (error) {
    console.warn('Error reading participants from Firestore:', error);
  }
  return getLocalParticipants();
}

export async function toggleParticipantActive(id: string, active: boolean): Promise<void> {
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, id);
    await updateDoc(docRef, { active });
  } catch (err) {
    console.warn('Firestore toggle error:', err);
  }
  const local = getLocalParticipants().map((p) => (p.id === id ? { ...p, active } : p));
  localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(local));
}

export async function resetParticipantAttempts(id: string): Promise<void> {
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, id);
    await updateDoc(docRef, { attemptsUsed: 0 });
  } catch (err) {
    console.warn('Firestore reset attempts error:', err);
  }
  const local = getLocalParticipants().map((p) => (p.id === id ? { ...p, attemptsUsed: 0 } : p));
  localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(local));
}

export async function resetAllParticipantsAttempts(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.update(d.ref, { attemptsUsed: 0 });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore batch reset error:', err);
  }
  const local = getLocalParticipants().map((p) => ({ ...p, attemptsUsed: 0 }));
  localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(local));
}

export async function deleteParticipant(id: string): Promise<void> {
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }
  const local = getLocalParticipants().filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(local));
}

// Local storage helper utilities
function getLocalParticipants(): Participant[] {
  try {
    const saved = localStorage.getItem(LOCAL_PARTICIPANTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalParticipant(participant: Participant): void {
  const current = getLocalParticipants();
  const idx = current.findIndex((p) => p.dni === participant.dni || p.id === participant.id);
  if (idx >= 0) {
    current[idx] = participant;
  } else {
    current.push(participant);
  }
  localStorage.setItem(LOCAL_PARTICIPANTS_KEY, JSON.stringify(current));
}
