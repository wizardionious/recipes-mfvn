import type { UserRole } from "@recipes/shared";
import bcrypt from "bcryptjs";
import type { Model } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { env } from "@/config/env.js";

export interface UserDocument extends BaseDocument {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface UserModelType extends Model<UserDocument> {}

const userSchema = new Schema<UserDocument, UserModelType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const USER_MODEL_NAME = "User";
export const UserModel = model<UserDocument, UserModelType>(
  USER_MODEL_NAME,
  userSchema,
);
