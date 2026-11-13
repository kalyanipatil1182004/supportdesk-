
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { usersRepository } from "../repositories/users.repository";
import type { z } from "zod";
import { loginSchema, registerSchema } from "../validators/auth.schema";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const saltRounds = 12;

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await usersRepository.findByEmail(data.email);

    if (existingUser) {
      return { success: false as const };
    }

    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    try {
      const user = await usersRepository.create({
        name: data.name,
        email: data.email,
        passwordHash,
      });

      return { success: true as const, user };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return { success: false as const };
      }

      throw error;
    }
  },

  async login(data: LoginInput) {
    const user = await usersRepository.findByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return { success: false as const };
    }

    const token = jwt.sign(
      { sub: String(user.id) },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] }
    );

    const { passwordHash: _passwordHash, ...safeUser } = user;

    return { success: true as const, user: safeUser, token };
  },
};
