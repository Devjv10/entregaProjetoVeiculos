import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .min(60)
    .max(86400)
    .default(28800),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Configure as variáveis de ambiente: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
  );
}
export const env = parsed.data;
