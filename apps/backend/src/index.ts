import { buildApp } from "./app.js";
import { ensureRootAdmin } from "./common/bootstrap/admin.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function start() {
  await connectDatabase();
  await ensureRootAdmin();

  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const signals = ["SIGINT", "SIGTERM"] as const satisfies NodeJS.Signals[];

  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info({ signal }, "Received signal, shutting down gracefully");
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    });
  }
}

start();
