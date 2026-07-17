import FreshnessBadge from "@/components/FreshnessBadge";
import MdBody from "@/components/MdBody";
import ToolShell from "@/components/projects/ToolShell";
import { loadChecklist } from "@/lib/content/loader";

export const metadata = { title: "銀行相談チェックリスト | 農産物輸出ナビ" };

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
