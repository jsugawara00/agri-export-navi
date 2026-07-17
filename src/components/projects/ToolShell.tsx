import Link from "next/link";

/** 書類ツール共通のページ枠（ヘッダ＋案件ナビへ戻る導線） */
export default function ToolShell({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm tracking-widest text-dim hover:text-foreground">
          <span className="font-semibold text-foreground">Toika</span>
          <span className="mx-2">|</span>農産物輸出ナビ
        </Link>
        <Link href={`/projects/${id}`} className="text-xs text-teal underline">
          ← 案件ナビへ戻る
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-12">
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
