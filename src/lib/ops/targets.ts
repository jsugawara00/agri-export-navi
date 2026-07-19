import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "../content/frontmatter";
import type { Thresholds, WatchTarget } from "./patrol";

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * 巡回対象: 鮮度メタデータを持つmd。
 * criteria/countries/guides に加え、procedures（ステップ定義・年1回見直し）、
 * reference（県統計・年1回＋出典差分検知）を含む。
 */
const WATCH_DIRS = [
  "criteria/institutional",
  "criteria/geopolitical",
  "criteria/logistics",
  "countries",
  "guides",
  "procedures",
  "reference",
];

export function collectTargets(): WatchTarget[] {
  const targets: WatchTarget[] = [];
  for (const dir of WATCH_DIRS) {
    const full = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(full)) continue;
    for (const name of fs.readdirSync(full)) {
      if (!name.endsWith(".md")) continue;
      const rel = `${dir}/${name}`;
      const { data } = parseFrontmatter(fs.readFileSync(path.join(full, name), "utf-8"));
      targets.push({
        file: `content/${rel}`,
        freshness: (data["freshness"] as WatchTarget["freshness"]) ?? "C",
        retrievedAt: data["retrieved_at"] ?? "",
        sourceUrl: data["source_url"],
      });
    }
  }
  return targets;
}

/** 鮮度上限（判断基準）は content/ops/patrol.md の frontmatter が単一情報源 */
export function loadThresholds(): Thresholds {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "ops/patrol.md"), "utf-8");
  const { data } = parseFrontmatter(raw);
  return {
    W: Number(data["stale_days_W"] ?? 7),
    A: Number(data["stale_days_A"] ?? 30),
    B: Number(data["stale_days_B"] ?? 90),
    C: Number(data["stale_days_C"] ?? 365),
  };
}
