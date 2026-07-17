"use client";

/** 書類フォーム共通の1項目（select or input）。onBlurで保存する */
export default function FieldInput({
  label,
  placeholder,
  value,
  options,
  onChange,
  onSave,
}: {
  label: string;
  placeholder: string;
  value: string;
  options?: string[];
  onChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-dim">{label}</span>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          className="mt-1 w-full rounded border border-line bg-panel px-2.5 py-2 text-sm focus:border-teal focus:outline-none"
        >
          <option value="">（選択してください）</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          className="mt-1 w-full rounded border border-line bg-panel px-2.5 py-2 text-sm placeholder:text-dim/40 focus:border-teal focus:outline-none"
        />
      )}
    </label>
  );
}
