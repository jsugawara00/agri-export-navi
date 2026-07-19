import fs from "node:fs";
import path from "node:path";
import { extractSection, parseFrontmatter, parseKeyedList } from "./frontmatter";
import type {
  ContentMeta,
  CriteriaAxis,
  CriteriaDoc,
  CountryDoc,
  Freshness,
  ProcedureDoc,
  ProcedureStep,
} from "./types";
import type { CountryId, ItemId } from "./catalog";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readMd(relPath: string): { data: Record<string, string>; body: string } {
  const full = path.join(CONTENT_DIR, relPath);
  const raw = fs.readFileSync(full, "utf-8");
  return parseFrontmatter(raw);
}

export function contentFileExists(relPath: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, relPath));
}

/** frontmatterだけを読む（整備状況 status: pending_research の判定などに使用） */
export function readFrontmatter(relPath: string): Record<string, string> {
  return readMd(relPath).data;
}

/**
 * 組み合わせのmdが整備済みか（v1.1）。
 * institutional / procedures / countries の3点が揃い、かつ
 * status: pending_research が付いていない場合のみ採点対象とする。
 * 未整備の組み合わせはUIで「情報整備中」と表示する（空欄や推測値を出さない）。
 */
export function comboPrepared(item: ItemId, country: CountryId): boolean {
  const instPath = `criteria/institutional/${item}_${country}.md`;
  const procPath = `procedures/${item}_${country}.md`;
  if (
    !contentFileExists(instPath) ||
    !contentFileExists(procPath) ||
    !contentFileExists(`countries/${country}.md`)
  ) {
    return false;
  }
  if (readFrontmatter(instPath)["status"] === "pending_research") return false;
  if (readFrontmatter(procPath)["status"] === "pending_research") return false;
  return true;
}

function toMeta(data: Record<string, string>, file: string): ContentMeta {
  const freshness = data["freshness"] as Freshness;
  if (!freshness || !["A", "B", "C"].includes(freshness)) {
    throw new Error(`${file}: frontmatter に freshness (A|B|C) がありません`);
  }
  if (!data["source"]) throw new Error(`${file}: frontmatter に source がありません`);
  if (!data["retrieved_at"]) throw new Error(`${file}: frontmatter に retrieved_at がありません`);
  return {
    freshness,
    source: data["source"],
    sourceUrl: data["source_url"],
    retrievedAt: data["retrieved_at"],
    reviewedBy: data["reviewed_by"],
  };
}

function toCriteriaDoc(axis: CriteriaAxis, relPath: string): CriteriaDoc {
  const { data, body } = readMd(relPath);
  const meta = toMeta(data, relPath);
  const prohibited = data["prohibited"] === "true";
  const deductions = parseKeyedList(extractSection(body, "減点項目")).map((e) => ({
    id: e["id"] ?? "",
    points: Number(e["points"]),
    label: e["label"] ?? "",
    remedy: e["remedy"] ?? "",
    stepRef: e["step_ref"] ?? "",
  }));
  return {
    axis,
    meta,
    prohibited,
    prohibitedReason: data["prohibited_reason"],
    deductions: prohibited ? [] : deductions,
    overview: extractSection(body, "概要"),
  };
}

export function loadInstitutional(item: ItemId, country: CountryId): CriteriaDoc {
  return toCriteriaDoc("institutional", `criteria/institutional/${item}_${country}.md`);
}

export function loadGeopolitical(country: CountryId): CriteriaDoc {
  return toCriteriaDoc("geopolitical", `criteria/geopolitical/${country}.md`);
}

export function loadLogistics(route: string): CriteriaDoc {
  return toCriteriaDoc("logistics", `criteria/logistics/${route}.md`);
}

export function loadCountry(country: CountryId): CountryDoc {
  const file = `countries/${country}.md`;
  const { data, body } = readMd(file);
  const meta = toMeta(data, file);
  for (const key of ["name_ja", "route", "population", "currency", "language", "safety_level"]) {
    if (!data[key]) throw new Error(`${file}: frontmatter に ${key} がありません`);
  }
  return {
    id: country,
    meta,
    nameJa: data["name_ja"],
    route: data["route"],
    population: data["population"],
    currency: data["currency"],
    language: data["language"],
    safetyLevel: data["safety_level"],
    safetyNote: extractSection(body, "治安"),
    quarantineSummary: extractSection(body, "検疫概要"),
    epaSummary: extractSection(body, "EPA・関税"),
  };
}

export function loadProcedure(item: ItemId, country: CountryId): ProcedureDoc {
  const file = `procedures/${item}_${country}.md`;
  const { data, body } = readMd(file);
  const meta = toMeta(data, file);
  const steps: ProcedureStep[] = parseKeyedList(extractSection(body, "ステップ")).map((e) => ({
    id: e["id"] ?? "",
    layer: Number(e["layer"]) as 1 | 2 | 3,
    title: e["title"] ?? "",
    titleEn: e["title_en"],
    purpose: e["purpose"] ?? "",
    tool: e["tool"] as ProcedureStep["tool"],
    gate: e["gate"],
    requires: (e["requires"] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    questions: Object.keys(e)
      .filter((k) => /^q\d+$/.test(k))
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
      .map((k) => e[k]),
  }));
  return { meta, steps };
}

export interface ForwarderEntry {
  id: string;
  name: string;
  note: string;
}

export interface PortDoc {
  id: string;
  meta: ContentMeta;
  nameJa: string;
  /** true=最寄り港候補 / false=東京港（2択方式の区分） */
  nearest: boolean;
  overview: string;
  forwarders: ForwarderEntry[];
}

/** 港の乙仲リスト（forwarders/{port}.md） */
export function loadPort(port: string): PortDoc {
  const file = `forwarders/${port}.md`;
  const { data, body } = readMd(file);
  const meta = toMeta(data, file);
  if (!data["name_ja"]) throw new Error(`${file}: frontmatter に name_ja がありません`);
  return {
    id: port,
    meta,
    nameJa: data["name_ja"],
    nearest: data["nearest"] === "true",
    overview: extractSection(body, "概要"),
    forwarders: parseKeyedList(extractSection(body, "乙仲リスト")).map((e) => ({
      id: e["id"] ?? "",
      name: e["name"] ?? "",
      note: e["note"] ?? "",
    })),
  };
}

/** 自治体mdの ports:（利用しやすい港のid一覧）を読む */
export function loadMunicipalityPorts(municipality: string): string[] {
  const { data } = readMd(`municipalities/${municipality}.md`);
  return (data["ports"] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface ChecklistDoc {
  meta: ContentMeta;
  title: string;
  body: string;
}

/** チェックリストmd（checklists/{name}.md）を読む */
export function loadChecklist(name: string): ChecklistDoc {
  const file = `checklists/${name}.md`;
  const { data, body } = readMd(file);
  const meta = toMeta(data, file);
  const firstHeading = body.match(/^## (.+)$/m);
  return { meta, title: firstHeading?.[1] ?? name, body };
}

/** ステップ別ガイドmd（guides/{stepId}.md）を読む */
export function loadGuide(stepId: string): ChecklistDoc {
  const file = `guides/${stepId}.md`;
  const { data, body } = readMd(file);
  const meta = toMeta(data, file);
  return { meta, title: data["title"] ?? stepId, body };
}

export function guideExists(stepId: string): boolean {
  // パス操作を防ぐため、ステップidの形式に限定する
  if (!/^[a-z0-9-]+$/.test(stepId)) return false;
  return contentFileExists(`guides/${stepId}.md`);
}

/** 品目×国の3軸採点mdを一括ロードする（国mdのroute経由で物流mdを解決） */
export function loadCriteriaSet(item: ItemId, country: CountryId) {
  const countryDoc = loadCountry(country);
  return {
    country: countryDoc,
    institutional: loadInstitutional(item, country),
    geopolitical: loadGeopolitical(country),
    logistics: loadLogistics(countryDoc.route),
  };
}
