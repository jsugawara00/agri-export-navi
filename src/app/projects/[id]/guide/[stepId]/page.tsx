import Link from "next/link";
import FreshnessBadge from "@/components/FreshnessBadge";
import MdBody from "@/components/MdBody";
import ToolShell from "@/components/projects/ToolShell";
import { guideExists, loadGuide } from "@/lib/content/loader";

export const metadata = { title: "ステップガイド | 農産物輸出ナビ" };

/** ステップ別ガイド（content/guides/{stepId}.md を描画。md編集だけで差し替え可能） */
export default async function StepGuidePage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;

  if (!guideExists(stepId)) {
    return (
      <ToolShell id={id} title="ステップガイド">
        <p className="mt-6 text-sm text-dim">
          このステップのガイドはまだ整備されていません（content/guides/{stepId}.md）。
          <Link href={`/projects/${id}`} className="ml-1 text-teal underline">
            案件ナビへ戻る
          </Link>
        </p>
      </ToolShell>
    );
  }

  const guide = loadGuide(stepId);
  return (
    <ToolShell id={id} title={guide.title}>
      <div className="mt-4 rounded-xl border border-line bg-panel p-5">
        <MdBody body={guide.body} />
        <div className="mt-4">
          <FreshnessBadge meta={guide.meta} />
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-dim/80">
        本ガイドは雛形です。手続き・締切等は変わることがあるため、
        最終確認は植物防疫所等の公的機関・各窓口へお願いします。
      </p>
    </ToolShell>
  );
}
