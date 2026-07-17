"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { resolveStore, type ProjectStore } from "@/lib/projects/store";
import type { Project } from "@/lib/projects/types";

/** 案件の読込・保存の共通フック（ナビ画面・書類ツールで共用） */
export function useProject(id: string) {
  const { enabled, user, loading, signIn } = useAuth();
  const uid = user?.uid ?? null;
  const store: ProjectStore | null = useMemo(
    () => (loading ? null : resolveStore(uid)),
    [loading, uid],
  );
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!store) return;
    let alive = true;
    store.get(id).then((p) => {
      if (!alive) return;
      if (p) setProject(p);
      else setNotFound(true);
    });
    return () => {
      alive = false;
    };
  }, [store, id]);

  const persist = async (updated: Project) => {
    setProject(updated);
    await store?.save(updated);
  };

  /** 未ログイン等で操作できない状態か（UI側でログイン誘導を出す） */
  const needsSignIn = !loading && enabled && !user;

  return { enabled, loading, signIn, store, project, notFound, needsSignIn, persist };
}
