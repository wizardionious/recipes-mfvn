import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { toObjectId } from "@/common/utils/mongo.js";

describe("toObjectId", () => {
  it("should convert a valid hex string to ObjectId", () => {
    const hex = "507f1f77bcf86cd799439011";
    const result = toObjectId(hex);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result.toHexString()).toBe(hex);
  });

  it("should throw on invalid hex string", () => {
    expect(() => toObjectId("invalid")).toThrow();
  });
});
