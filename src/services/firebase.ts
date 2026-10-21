import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GithubAuthProvider,
  User,
  Auth,
} from 'firebase/auth';
import { RepoHealthSummary, UserConfig } from '../types';

const STORAGE_KEY_CONFIG = 'repo_pulse_user_config';
const STORAGE_KEY_CACHE = 'repo_pulse_health_cache';

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getEffectiveFirebaseConfig(): UserConfig['firebaseConfig'] | null {
  // 1. First priority: Environment variables (from .env.local or GitHub Secrets in Actions)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  // 2. Second priority: Local storage configuration
  const local = getLocalConfig();
  if (local.firebaseConfig?.apiKey && local.firebaseConfig?.projectId) {
    return local.firebaseConfig;
  }

  return null;
}

export function initializeFirebase(customConfig?: UserConfig['firebaseConfig']): boolean {
  const config = customConfig || getEffectiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return false;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    return true;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return false;
  }
}

// Auto-initialize on import if env vars are present
initializeFirebase();

export function isFirebaseConfigured(): boolean {
  return !!auth && !!db;
}

/**
 * 1-Click Sign in with GitHub using Firebase OAuth Provider
 * Requests 'repo', 'security_events', and 'actions:read' scopes
 */
export async function signInWithGitHub(): Promise<{ user: User; githubToken: string }> {
  if (!auth) {
    const initialized = initializeFirebase();
    if (!initialized || !auth) {
      throw new Error('Firebase is not configured. Please provide Firebase credentials in Settings or .env.');
    }
  }

  const provider = new GithubAuthProvider();
  provider.addScope('repo');
  provider.addScope('security_events');
  provider.addScope('actions:read');

  const result = await signInWithPopup(auth, provider);
  const credential = GithubAuthProvider.credentialFromResult(result);
  const githubToken = credential?.accessToken || '';

  return {
    user: result.user,
    githubToken,
  };
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    initializeFirebase();
  }
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
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
    autoRefreshInterval: 120000,
    useFirebaseSync: true,
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
 * Cloud sync user dashboard data to Firestore (secured by firestore.rules)
 */
export async function syncHealthToCloud(
  userId: string,
  monitoredRepos: string[],
  summaries: RepoHealthSummary[]
): Promise<boolean> {
  if (!db) return false;
  try {
    const userDocRef = doc(db, 'user_dashboards', userId);
    await setDoc(
      userDocRef,
      {
        monitoredRepos,
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

export async function fetchHealthFromCloud(
  userId: string
): Promise<{ monitoredRepos: string[]; summaries: RepoHealthSummary[] } | null> {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'user_dashboards', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        monitoredRepos: data.monitoredRepos || [],
        summaries: data.summaries || [],
      };
    }
  } catch (err) {
    console.warn('Firebase Firestore read failed:', err);
  }
  return null;
}
