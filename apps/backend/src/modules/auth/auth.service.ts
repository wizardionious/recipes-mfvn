import type { User } from "@recipes/shared";
import type { JwtPayload } from "@/common/utils/jwt.js";
import { signToken } from "@/common/utils/jwt.js";
import type { LoginBody, RegisterBody } from "@/modules/auth/auth.schema.js";
import { User as UserModel } from "@/modules/auth/user.model.js";

function toUser(doc: unknown): User {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    email: d.email as string,
    name: d.name as string,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  async register(data: RegisterBody): Promise<AuthResponse> {
    const exists = await UserModel.findOne({ email: data.email });
    if (exists) {
      throw Object.assign(new Error("Email already in use"), {
        statusCode: 409,
      });
    }

    const user = await UserModel.create(data);
    const token = this.generateToken(user.id, user.email);

    return {
      user: toUser(user.toObject()),
      token,
    };
  }

  async login(data: LoginBody): Promise<AuthResponse> {
    const user = await UserModel.findOne({ email: data.email })
      .select("+password")
      .lean();
    if (!user || !(await user.comparePassword(data.password))) {
      throw Object.assign(new Error("Invalid email or password"), {
        statusCode: 401,
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: toUser(user),
      token,
    };
  }

  async me(userId: string): Promise<User> {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
      });
    }

    return toUser(user);
  }

  private generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { userId, email };
    return signToken(payload);
  }
}
