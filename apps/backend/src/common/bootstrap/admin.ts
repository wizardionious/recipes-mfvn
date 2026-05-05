import type { Logger } from "@/common/logger.js";
import { env } from "@/config/env.js";
import { UserModel } from "@/modules/users/user.model.js";

type LoggerPort = Pick<Logger, "error" | "warn" | "info">;

export async function ensureRootAdmin(log: LoggerPort): Promise<void> {
  const existing = await UserModel.findOne({ role: "admin" });
  if (existing) {
    log.info({ email: env.ROOT_ADMIN_EMAIL }, "Root admin already exists");
    return;
  }

  await UserModel.create({
    email: env.ROOT_ADMIN_EMAIL,
    password: env.ROOT_ADMIN_PASSWORD,
    name: "Root Admin",
    role: "admin",
  });

  log.info({ email: env.ROOT_ADMIN_EMAIL }, "Root admin created");
}
