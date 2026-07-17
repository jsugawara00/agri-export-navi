import ToolShell from "@/components/projects/ToolShell";
import InvoiceTool from "@/components/projects/tools/InvoiceTool";
import { buildAllCombos } from "@/lib/content/combos";

export const metadata = { title: "インボイス・パッキングリスト | 農産物輸出ナビ" };

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ToolShell id={id} title="インボイス・パッキングリスト">
      <InvoiceTool id={id} combos={buildAllCombos()} />
    </ToolShell>
  );
}
