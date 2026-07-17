import { StyleSheet } from "@react-pdf/renderer";

/**
 * PDF共通スタイル。
 * 注意: 標準フォント（Helvetica）のため日本語グリフは表示できない。
 * 輸出書類の実務に合わせ、PDF本文は英文とする（UI側で日本語の説明を出す）。
 */
export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  clauseTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 3,
  },
  value: {
    fontFamily: "Helvetica-Bold",
  },
  missing: {
    color: "#b45309",
  },
  block: {
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: "#555555",
    marginBottom: 1,
  },
  row: {
    flexDirection: "row",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#333333",
    paddingVertical: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#999999",
    paddingVertical: 6,
    fontSize: 9,
  },
  watermark: {
    position: "absolute",
    top: 300,
    left: 60,
    fontSize: 110,
    fontFamily: "Helvetica-Bold",
    color: "#d1d5db",
    opacity: 0.35,
    transform: "rotate(-30deg)",
  },
  outstandingBox: {
    marginTop: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#b45309",
  },
  outstandingTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#b45309",
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    fontSize: 7.5,
    color: "#666666",
    textAlign: "center",
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  signBox: {
    width: "45%",
  },
  signLine: {
    borderBottomWidth: 1,
    borderColor: "#333333",
    height: 28,
    marginBottom: 4,
  },
});
