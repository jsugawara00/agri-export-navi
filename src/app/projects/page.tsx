import Link from "next/link";
import ProjectsClient from "@/components/projects/ProjectsClient";
import { buildAllCombos } from "@/lib/content/combos";

export const metadata = { title: "保存した案件 | 農産物輸出ナビ" };

export default function ProjectsPage() {
  const combos = buildAllCombos();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm tracking-widest text-dim hover:text-foreground">
          <span className="font-semibold text-foreground">Toika</span>
          <span className="mx-2">|</span>農産物輸出ナビ
        </Link>
        <Link href="/" className="text-xs text-teal underline">
          新しく調べる
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-12">
        <h1 className="text-2xl font-bold">保存した案件</h1>
        <ProjectsClient combos={combos} />
      </main>
    </div>
  );
}
