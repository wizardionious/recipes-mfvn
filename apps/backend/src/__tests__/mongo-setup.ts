import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";

let mongoServer: MongoMemoryServer;

function getTestDbName() {
  const poolId = process.env.VITEST_POOL_ID ?? "0";
  return `test_db_${poolId}`;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: "8.0.21" },
  });
  await mongoose.connect(mongoServer.getUri(), {
    dbName: getTestDbName(),
  });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
