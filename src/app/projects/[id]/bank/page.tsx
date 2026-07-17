import FreshnessBadge from "@/components/FreshnessBadge";
import ToolShell from "@/components/projects/ToolShell";
import { loadChecklist } from "@/lib/content/loader";

export const metadata = { title: "銀行相談チェックリスト | 農産物輸出ナビ" };

/** チェックリストmdの簡易描画（見出し・リスト・段落のみ） */
function MdBody({ body }: { body: string }) {
  const lines = body.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let list: { text: string; nested: boolean }[] = [];

  const flushList = (key: number) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="mt-2 space-y-1.5">
        {list.map((item, i) => (
          <li
            key={i}
            className={`text-sm leading-relaxed ${item.nested ? "ml-6 text-dim" : "ml-1"}`}
          >
            <span className="mr-1.5 text-teal">{item.nested ? "◦" : "•"}</span>
            {item.text}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((line, i) => {
    const nested = /^\s+- /.test(line);
    const top = /^- /.test(line);
    if (top || nested) {
      list.push({ text: line.replace(/^\s*- /, ""), nested });
      return;
    }
    flushList(i);
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={i} className="mt-4 text-base font-semibold">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.trim()) {
      blocks.push(
        <p key={i} className="mt-2 text-sm leading-relaxed text-dim">
          {line}
        </p>,
      );
    }
  });
  flushList(lines.length);
  return <>{blocks}</>;
}

export default async function BankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const checklist = loadChecklist("bank-consultation");
  return (
    <ToolShell id={id} title="銀行相談チェックリスト">
      <div className="mt-4 rounded-xl border border-line bg-panel p-5">
        <MdBody body={checklist.body} />
        <div className="mt-4">
          <FreshnessBadge meta={checklist.meta} />
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-dim/80">
        銀行の外為窓口への相談は層2（実行はあなた）です。このチェックリストを持って
        事前相談すると話が早く進みます。個別の金融助言は銀行・専門窓口へ。
      </p>
    </ToolShell>
  );
}
