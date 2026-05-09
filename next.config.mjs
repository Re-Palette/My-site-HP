/** @type {import('next').NextConfig} */
// GitHub Pages Project Page: https://re-palette.github.io/My-site-HP/
// リポジトリ名と完全一致させる（大文字・小文字も含む）
const basePath = "/My-site-HP";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
