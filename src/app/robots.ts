import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/trip/", "/carrier/"],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/bookings/",
          "/carrier/dashboard",
          "/carrier/onboarding",
          "/carrier/payouts",
          "/carrier/post",
          "/carrier/stats",
          "/carrier/templates",
          "/carrier/trips",
          "/saved-searches/",
        ],
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
