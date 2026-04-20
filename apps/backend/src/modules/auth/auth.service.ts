import type { AuthResponse, LoginBody, RegisterBody } from "@recipes/shared";
import { ConflictError, UnauthorizedError } from "@/common/errors.js";
import type { Logger } from "@/common/logger.js";
import { signToken } from "@/common/utils/jwt.js";
import { toUser } from "@/common/utils/mongo.js";
import type { UserModelType } from "@/modules/users/user.model.js";

export interface AuthService {
  register(data: RegisterBody): Promise<AuthResponse>;
  login(data: LoginBody): Promise<AuthResponse>;
}

export function createAuthService(
  userModel: UserModelType,
  log: Logger,
): AuthService {
  return {
    register: async (data) => {
      const exists = await userModel.exists({ email: data.email });
      if (exists) {
        log.warn(
          { email: data.email },
          "Registration attempt with existing email",
        );
        throw new ConflictError("Email already in use");
      }

      const user = await userModel.create(data);
      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      log.info({ userId: user.id, email: user.email }, "User registered");

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
        log.warn({ email: data.email }, "Failed login attempt");
        throw new UnauthorizedError("Invalid email or password");
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      log.info({ userId: user.id, email: user.email }, "User logged in");

      return {
        user: toUser(user.toObject()),
        token,
      };
    },
  };
}
