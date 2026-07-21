import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 親ディレクトリに別のlockfileがあるため、ワークスペースルートを明示する
  outputFileTracingRoot: path.join(__dirname),

  // 全ページ共通のセキュリティヘッダ
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 他サイトのiframeに埋め込まれるのを防ぐ（無断転載・なりすまし対策）
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Content-Typeの推測を禁止（配信ファイルを別種として実行させない）
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 外部サイトへは参照元をオリジンまでに留める
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 使っていないブラウザ機能を無効化
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
