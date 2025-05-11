import { getAuth } from "@hono/clerk-auth";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AuthObject } from "@clerk/backend";

const factory = createFactory<{
  Variables: { user: Extract<AuthObject, { userId: string }> };
}>();

export const authGuard = () =>
  factory.createMiddleware(async (c, next) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    c.set("user", auth);

    await next();
  });
