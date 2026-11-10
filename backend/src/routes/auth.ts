import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { authenticate, publicUser } from "../middlewares/auth.js";
import { loginSchema, registerSchema } from "../schemas/index.js";
import { AppError } from "../utils/errors.js";

export const authRouter = Router();
const limiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: { error: { message: "Muitas tentativas. Aguarde 15 minutos." } },
});
const dummyHash = bcrypt.hashSync("driveflow-invalid-login-padding", 12);

function token(id: string) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: id,
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    issuer: "driveflow",
    audience: "driveflow-web",
  });
}

authRouter.post("/register", limiter, async (req, res) => {
  const input = registerSchema.parse(req.body);
  const user = await prisma.user.create({
    data: {
      ...input,
      password: await bcrypt.hash(input.password, 12),
      role: "CLIENTE",
    },
    select: publicUser,
  });
  res.status(201).json({ data: { user, token: token(user.id) } });
});

authRouter.post("/login", limiter, async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await bcrypt.compare(
    input.password,
    user?.password ?? dummyHash,
  );
  if (!user || !valid) throw new AppError(401, "E-mail ou senha incorretos.");
  const { id, name, email, role, createdAt } = user;
  res.json({
    data: { user: { id, name, email, role, createdAt }, token: token(id) },
  });
});

authRouter.get("/me", authenticate, (req, res) => res.json({ data: req.user }));
