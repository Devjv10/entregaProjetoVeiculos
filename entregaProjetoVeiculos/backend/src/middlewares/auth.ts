import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/errors.js";

declare module "express-serve-static-core" {
  interface Request {
    user: { id: string; name: string; email: string; role: Role };
  }
}

export const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer "))
    throw new AppError(401, "Entre na sua conta para continuar.");
  let subject: string;
  try {
    const payload = jwt.verify(authorization.slice(7), env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "driveflow",
      audience: "driveflow-web",
    });
    if (typeof payload === "string" || typeof payload.sub !== "string")
      throw new Error();
    subject = payload.sub;
  } catch {
    throw new AppError(
      401,
      "Sessão expirada ou inválida. Faça login novamente.",
    );
  }
  const user = await prisma.user.findUnique({
    where: { id: subject },
    select: publicUser,
  });
  if (!user) throw new AppError(401, "Usuário não encontrado.");
  req.user = user;
  next();
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role))
      throw new AppError(403, "Você não tem permissão para esta ação.");
    next();
  };
}
