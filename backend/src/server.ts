import { buildApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function start() {
  await connectDatabase();

  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
