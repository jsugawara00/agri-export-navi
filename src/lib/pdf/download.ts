"use client";

import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** PDFをクライアント側で生成してダウンロードする */
export async function downloadPdf(
  doc: ReactElement<DocumentProps>,
  filename: string,
): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
