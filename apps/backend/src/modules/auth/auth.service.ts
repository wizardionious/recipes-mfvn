import type { AuthResponse } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import type { JwtPayload } from "@/common/utils/jwt.js";
import { signToken } from "@/common/utils/jwt.js";
import { toUser } from "@/common/utils/mongo.js";
import type { LoginBody, RegisterBody } from "@/modules/auth/auth.schema.js";
import { UserModel } from "@/modules/users/user.model.js";

export class AuthService {
  async register(data: RegisterBody): Promise<AuthResponse> {
    const exists = await UserModel.findOne({ email: data.email });
    if (exists) {
      throw new AppError("Email already in use", 409);
    }

    const user = await UserModel.create(data);
    const token = this.generateToken(user.id, user.email);

    return {
      user: toUser(user.toObject()),
      token,
    };
  }

  async login(data: LoginBody): Promise<AuthResponse> {
    const user = await UserModel.findOne({ email: data.email }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(data.password))) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: toUser(user.toObject()),
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { userId, email };
    return signToken(payload);
  }
}
