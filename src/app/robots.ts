import type { MetadataRoute } from "next";

// NOTE: the hidden admin path is intentionally NOT listed here (listing it would reveal it).
// The admin page itself sends a noindex header/meta instead.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/api"] }],
  };
}
