import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "../content/frontmatter";

export const OPS_DIR = path.join(process.cwd(), "ops");
export const QUEUE_DIR = path.join(OPS_DIR, "review-queue");
export const SNAPSHOT_DIR = path.join(OPS_DIR, "snapshots");

export interface QueueItem {
  filename: string;
  status: string;
  detectedAt: string;
  sourceUrl: string;
  targets: string[];
}

/** 運用者確認キューの一覧（frontmatterのみ読む） */
export function listQueueItems(): QueueItem[] {
  if (!fs.existsSync(QUEUE_DIR)) return [];
  return fs
    .readdirSync(QUEUE_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const { data } = parseFrontmatter(
        fs.readFileSync(path.join(QUEUE_DIR, filename), "utf-8"),
      );
      return {
        filename,
        status: data["status"] ?? "pending",
        detectedAt: data["detected_at"] ?? "",
        sourceUrl: data["source_url"] ?? "",
        targets: (data["targets"] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    })
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

/** 同じ情報源のpendingキューが既にあるか（重複起票防止） */
export function hasPendingFor(sourceUrl: string): boolean {
  return listQueueItems().some((q) => q.status === "pending" && q.sourceUrl === sourceUrl);
}
