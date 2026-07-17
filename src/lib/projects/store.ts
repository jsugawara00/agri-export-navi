"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firebaseEnabled, getFirebaseApp } from "@/lib/firebase/client";
import type { Project } from "./types";

/**
 * 案件ストア。Firebase設定済み＋ログイン時はFirestore、
 * 未設定時はブラウザのlocalStorage（ローカル保存モード）に保存する。
 */
export interface ProjectStore {
  mode: "local" | "firestore";
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  remove(id: string): Promise<void>;
}

const LOCAL_KEY = "agri-export-navi/projects";

class LocalStore implements ProjectStore {
  mode = "local" as const;

  private read(): Project[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]") as Project[];
    } catch {
      return [];
    }
  }

  private write(projects: Project[]) {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
  }

  async list(): Promise<Project[]> {
    return this.read().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Project | null> {
    return this.read().find((p) => p.id === id) ?? null;
  }

  async save(project: Project): Promise<void> {
    const rest = this.read().filter((p) => p.id !== project.id);
    this.write([...rest, project]);
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((p) => p.id !== id));
  }
}

class FirestoreStore implements ProjectStore {
  mode = "firestore" as const;

  constructor(private uid: string) {}

  private col() {
    return collection(getFirestore(getFirebaseApp()), "projects");
  }

  async list(): Promise<Project[]> {
    const snap = await getDocs(query(this.col(), where("uid", "==", this.uid)));
    return snap.docs
      .map((d) => d.data() as Project)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Project | null> {
    const snap = await getDoc(doc(this.col(), id));
    if (!snap.exists()) return null;
    const project = snap.data() as Project;
    return project.uid === this.uid ? project : null;
  }

  async save(project: Project): Promise<void> {
    await setDoc(doc(this.col(), project.id), project);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.col(), id));
  }
}

/**
 * ストアの解決:
 * - Firebase未設定 → ローカル保存モード
 * - Firebase設定済み＋uidあり → Firestore
 * - Firebase設定済み＋未ログイン → null（UI側でログインを促す）
 */
export function resolveStore(uid: string | null): ProjectStore | null {
  if (!firebaseEnabled) return new LocalStore();
  if (uid) return new FirestoreStore(uid);
  return null;
}
