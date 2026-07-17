"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";

/**
 * Firebaseクライアント初期化。環境変数（NEXT_PUBLIC_FIREBASE_*）が
 * 設定されていない場合は無効となり、アプリはローカル保存モードで動く。
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseEnabled) {
    throw new Error("Firebaseが設定されていません（NEXT_PUBLIC_FIREBASE_* を確認）");
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(config);
  }
  return app;
}
