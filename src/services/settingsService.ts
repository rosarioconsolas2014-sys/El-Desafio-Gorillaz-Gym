import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GameSettings } from '../types';

export const DEFAULT_SETTINGS: GameSettings = {
  maxAttempts: 3,
  unlimitedAttempts: false,
  competitionEnabled: true,
  startDate: '2026-10-20',
  endDate: '2026-11-20',
  competitionTitle: 'GORILLAZ GYM - THE CHAMPION CHALLENGE',
  prizeTitle: 'PROTEÍNA WHEY 100% GOLD STANDARD 2 LBS',
  prizeSubtitle: '¡El mejor puntaje acumulado de los 3 niveles se lleva el pote de proteína y la gloria eterna!',
  gymLocation: 'Sede Central - GORILLAZ GYM',
  adminPasscode: 'GORILLA2025'
};

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'game_config';
const LOCAL_CACHE_KEY = 'gorillaz_firestore_settings_cache';

export async function getGameSettings(): Promise<GameSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<GameSettings>;
      const merged: GameSettings = { ...DEFAULT_SETTINGS, ...data };
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));
      return merged;
    } else {
      // Initialize remote settings document if it doesn't exist yet
      await setDoc(docRef, DEFAULT_SETTINGS, { merge: true });
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.warn('Could not read settings from Firestore (using cached/default):', error);
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    if (cached) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }
}

export async function saveGameSettings(newSettings: Partial<GameSettings>): Promise<GameSettings> {
  try {
    const current = await getGameSettings();
    const updated: GameSettings = { ...current, ...newSettings };
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    await setDoc(docRef, updated, { merge: true });
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
    // Persist locally
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    const current = cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
    const updated = { ...current, ...newSettings };
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(updated));
    return updated;
  }
}
