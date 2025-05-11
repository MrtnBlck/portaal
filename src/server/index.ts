import { hc } from "hono/client";
import type { AppType } from "./api/router";

const publicUrl =
  process.env.PUBLIC_URL_DEV ?? process.env.PUBLIC_URL_PROD ?? "";

export const client = hc<AppType>(publicUrl, {
  async headers() {
    if (typeof window === "undefined") {
      const { headers } = await import("next/headers");
      return Object.fromEntries((await headers()).entries());
    }
    return {};
  },
  init: {
    credentials: "include",
  },
});
