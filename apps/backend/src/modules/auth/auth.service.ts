import type { LoginBody, RegisterBody } from "@auth/auth.schema.js";
import { User } from "@auth/user.model.js";
import { type JwtPayload, signToken } from "@common/utils/jwt.js";

interface AuthResponse {
  user: { id: string; email: string; name: string };
  token: string;
}

export class AuthService {
  async register(data: RegisterBody): Promise<AuthResponse> {
    const exists = await User.findOne({ email: data.email });
    if (exists) {
      throw Object.assign(new Error("Email already in use"), {
        statusCode: 409,
      });
    }

    const user = await User.create(data);
    const token = this.generateToken(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(data: LoginBody): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user || !(await user.comparePassword(data.password))) {
      throw Object.assign(new Error("Invalid email or password"), {
        statusCode: 401,
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { userId, email };
    return signToken(payload);
  }
}
