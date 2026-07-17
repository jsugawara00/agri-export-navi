export interface RawDoc {
  data: Record<string, string>;
  body: string;
}

/**
 * mdファイル先頭の `---` 区切りfrontmatter（フラットな key: value のみ）をパースする。
 * 依存ライブラリを増やさないための最小実装。
 */
export function parseFrontmatter(raw: string): RawDoc {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) data[key] = value;
  }
  return { data, body: raw.slice(m[0].length) };
}

/** `## 見出し` で始まるセクションの本文を取り出す（無ければ空文字） */
export function extractSection(body: string, heading: string): string {
  const sections = body.split(/^## /m);
  for (const sec of sections) {
    if (sec.startsWith(heading)) {
      return sec.slice(heading.length).trim();
    }
  }
  return "";
}

/**
 * `- id: xxx` で始まり、続くインデント行 `  key: value` を属性として持つ
 * リスト項目群をパースする（減点項目・ステップ定義の共通形式）。
 */
export function parseKeyedList(sectionBody: string): Record<string, string>[] {
  const entries: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;
  for (const line of sectionBody.split(/\r?\n/)) {
    const start = line.match(/^-\s+id:\s*(.+)$/);
    if (start) {
      current = { id: start[1].trim() };
      entries.push(current);
      continue;
    }
    const kv = line.match(/^\s+([a-z0-9_]+):\s*(.*)$/);
    if (kv && current) {
      current[kv[1]] = kv[2].trim();
    }
  }
  return entries;
}
