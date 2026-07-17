import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 親ディレクトリに別のlockfileがあるため、ワークスペースルートを明示する
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
