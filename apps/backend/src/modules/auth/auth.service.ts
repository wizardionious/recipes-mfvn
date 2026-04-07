import type { AuthResponse, LoginBody, RegisterBody } from "@recipes/shared";
import { ConflictError, UnauthorizedError } from "@/common/errors.js";
import { signToken } from "@/common/utils/jwt.js";
import { toUser } from "@/common/utils/mongo.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface AuthService {
  register(data: RegisterBody): Promise<AuthResponse>;
  login(data: LoginBody): Promise<AuthResponse>;
}

export function createAuthService(userModel: UserModelType): AuthService {
  return {
    register: async (data) => {
      const exists = await userModel.exists({ email: data.email });
      if (exists) {
        throw new ConflictError("Email already in use");
      }

      const user = await userModel.create(data);
      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: toUser(user.toObject()),
        token,
      };
    },
    login: async (data) => {
      const user = await userModel
        .findOne({ email: data.email })
        .select("+password");
      if (!user || !(await user.comparePassword(data.password))) {
        throw new UnauthorizedError("Invalid email or password");
      }

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: toUser(user.toObject()),
        token,
      };
    },
  };
}
