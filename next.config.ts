import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    // Desactivar optimización para imágenes de placeholder externas
    // (en producción con imágenes propias, se puede quitar esta línea)
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
