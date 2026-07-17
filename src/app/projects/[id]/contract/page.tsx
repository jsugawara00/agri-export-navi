import ToolShell from "@/components/projects/ToolShell";
import ContractTool from "@/components/projects/tools/ContractTool";
import { buildAllCombos } from "@/lib/content/combos";

export const metadata = { title: "英文契約書ひな形 | 農産物輸出ナビ" };

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ToolShell id={id} title="英文契約書ひな形">
      <ContractTool id={id} combos={buildAllCombos()} />
    </ToolShell>
  );
}
