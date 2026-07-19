import ToolShell from "@/components/projects/ToolShell";
import LogisticsTool from "@/components/projects/tools/LogisticsTool";
import { buildAllCombos } from "@/lib/content/combos";
import { loadExportRoutes, loadMunicipalityPorts, loadPort } from "@/lib/content/loader";

export const metadata = { title: "港選定・乙仲相談 | 農産物輸出ナビ" };

export default async function LogisticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ports = loadMunicipalityPorts("yamagata").map(loadPort);
  const routes = loadExportRoutes();
  return (
    <ToolShell id={id} title="港選定・乙仲相談">
      <LogisticsTool id={id} combos={buildAllCombos()} ports={ports} routes={routes} />
    </ToolShell>
  );
}
