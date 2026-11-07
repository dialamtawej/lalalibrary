import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // صور الأغلفة تأتي من Laravel (localhost:8000/storage). داخل Docker لا يستطيع
    // خادم Next الوصول إلى localhost:8000 لتحسين الصور، لذلك نعرضها كما هي.
    unoptimized: true,
  },
  experimental: {
    // رفع ملف الكتاب (حتى 20MB) يمر عبر Server Action ثم إلى Laravel
    serverActions: {
      bodySizeLimit: "30mb",
    },
    proxyClientMaxBodySize: "30mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
