import Link from "next/link";
import ProjectNavClient from "@/components/projects/ProjectNavClient";
import { buildAllCombos } from "@/lib/content/combos";

export const metadata = { title: "案件ナビ | 農産物輸出ナビ" };

export default async function ProjectNavPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const combos = buildAllCombos();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm tracking-widest text-dim hover:text-foreground">
          <span className="font-semibold text-foreground">Toika</span>
          <span className="mx-2">|</span>農産物輸出ナビ
        </Link>
        <Link href="/projects" className="text-xs text-teal underline">
          案件一覧へ
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-12">
        <ProjectNavClient id={id} combos={combos} />
      </main>
    </div>
  );
}
