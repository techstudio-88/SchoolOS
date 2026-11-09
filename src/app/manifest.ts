import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SchoolOS — School Management",
    short_name: "SchoolOS",
    description: "Your school's daily operations, in one app.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#080b16",
    theme_color: "#080b16",
    categories: ["education", "business", "productivity"],
    icons: [{ src: "/schoolos-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
