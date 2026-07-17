/**
 * 乙仲相談メールの下書き生成（テンプレート差し込み・決定論的）。
 * 送信機能は実装しない（コピーして本人が補正・送信する）。
 */

export interface MailVars {
  itemLabel: string;
  countryLabel: string;
  portLabel: string;
  quantity: string;
  timing: string;
  senderName: string;
  contact: string;
}

export function buildForwarderMail(v: MailVars): { subject: string; body: string } {
  const subject = `【ご相談】${v.itemLabel}の${v.countryLabel}向け輸出（${v.portLabel}利用）について`;
  const body = `ご担当者様

はじめまして。山形県で${v.itemLabel}を生産・販売しております${v.senderName || "（お名前）"}と申します。

このたび${v.countryLabel}のバイヤー様へ${v.itemLabel}の輸出を進めており、
${v.portLabel}からの海上輸送と輸出通関についてご相談したくご連絡いたしました。

■ ご相談内容
・品目: ${v.itemLabel}（要冷蔵）
・仕向地: ${v.countryLabel}
・利用希望港: ${v.portLabel}
・数量（予定）: ${v.quantity || "（数量未定・ご相談）"}
・希望時期: ${v.timing || "（時期未定・ご相談）"}

初めての輸出のため、必要な書類、コンテナ（リーファー等）の手配、
概算費用についてもあわせてご教示いただけますと幸いです。

ご対応の可否をお知らせいただけますでしょうか。
どうぞよろしくお願いいたします。

${v.senderName || "（お名前）"}
${v.contact || "（連絡先）"}`;
  return { subject, body };
}
