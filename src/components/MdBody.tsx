/** content mdの簡易描画（見出し・リスト・段落のみ対応） */
export default function MdBody({ body }: { body: string }) {
  const lines = body.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let list: { text: string; nested: boolean }[] = [];

  const flushList = (key: number) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="mt-2 space-y-1.5">
        {list.map((item, i) => (
          <li
            key={i}
            className={`text-sm leading-relaxed ${item.nested ? "ml-6 text-dim" : "ml-1"}`}
          >
            <span className="mr-1.5 text-teal">{item.nested ? "◦" : "•"}</span>
            {item.text}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((line, i) => {
    const nested = /^\s+- /.test(line);
    const top = /^- /.test(line);
    if (top || nested) {
      list.push({ text: line.replace(/^\s*- /, ""), nested });
      return;
    }
    flushList(i);
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={i} className="mt-4 text-base font-semibold">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.trim()) {
      blocks.push(
        <p key={i} className="mt-2 text-sm leading-relaxed text-dim">
          {line}
        </p>,
      );
    }
  });
  flushList(lines.length);
  return <>{blocks}</>;
}
