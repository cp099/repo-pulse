import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { RepoHealthSummary, UserConfig } from '../types';

const STORAGE_KEY_CONFIG = 'repo_pulse_user_config';
const STORAGE_KEY_CACHE = 'repo_pulse_health_cache';

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;

export function initializeFirebase(config: UserConfig['firebaseConfig']) {
  if (!config || !config.apiKey || !config.projectId) {
    firebaseApp = null;
    db = null;
    return null;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    db = getFirestore(firebaseApp);
    return db;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    firebaseApp = null;
    db = null;
    return null;
  }
}

export function getLocalConfig(): UserConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading config from localStorage', e);
  }

  return {
    githubToken: '',
    monitoredRepos: [],
    autoRefreshInterval: 120000, // 2 minutes default
    useFirebaseSync: false,
  };
}

export function saveLocalConfig(config: UserConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to localStorage', e);
  }
}

export function getLocalHealthCache(): RepoHealthSummary[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CACHE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading health cache from localStorage', e);
  }
  return null;
}

export function saveLocalHealthCache(summaries: RepoHealthSummary[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(summaries));
  } catch (e) {
    console.error('Error saving health cache to localStorage', e);
  }
}

/**
 * Cloud sync to Firestore if enabled
 */
export async function syncHealthToCloud(userId: string, summaries: RepoHealthSummary[]): Promise<boolean> {
  if (!db) return false;
  try {
    const userDocRef = doc(db, 'user_dashboards', userId);
    await setDoc(
      userDocRef,
      {
        summaries,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Firebase Firestore sync failed:', err);
    return false;
  }
}

export async function fetchHealthFromCloud(userId: string): Promise<RepoHealthSummary[] | null> {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'user_dashboards', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.summaries as RepoHealthSummary[]) || null;
    }
  } catch (err) {
    console.warn('Firebase Firestore read failed:', err);
  }
  return null;
}
