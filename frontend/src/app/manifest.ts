import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Истинный интеллект",
    short_name: "ИИ",
    description: "Аналитический кабинет присутствия на геосервисах",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#151616",
    theme_color: "#f53b00",
    lang: "ru",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
