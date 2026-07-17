"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseEnabled, getFirebaseApp } from "@/lib/firebase/client";

interface AuthState {
  /** Firebaseが設定されているか（未設定ならローカル保存モード） */
  enabled: boolean;
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  enabled: false,
  user: null,
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) return;
    const auth = getAuth(getFirebaseApp());
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    if (!firebaseEnabled) return;
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    // users/{uid} にプロフィールを保存（Firestoreデータモデル: 指示書7章）
    await setDoc(
      doc(getFirestore(app), "users", cred.user.uid),
      {
        displayName: cred.user.displayName,
        email: cred.user.email,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const signOut = async () => {
    if (!firebaseEnabled) return;
    await fbSignOut(getAuth(getFirebaseApp()));
  };

  return (
    <AuthContext.Provider
      value={{ enabled: firebaseEnabled, user, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
