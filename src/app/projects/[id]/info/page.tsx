import ToolShell from "@/components/projects/ToolShell";
import InfoView from "@/components/projects/InfoView";
import { buildAllCombos } from "@/lib/content/combos";

export const metadata = { title: "地域情報・判定内訳 | 農産物輸出ナビ" };

export default async function ProjectInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ToolShell id={id} title="地域情報・判定内訳">
      <InfoView id={id} combos={buildAllCombos()} />
    </ToolShell>
  );
}
