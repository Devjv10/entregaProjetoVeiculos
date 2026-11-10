import { Category, VehicleStatus } from "@prisma/client";
import { z } from "zod";

export const email = z
  .string()
  .trim()
  .email("E-mail inválido.")
  .max(191)
  .toLowerCase();
export const password = z
  .string()
  .min(8, "Use pelo menos 8 caracteres.")
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "A senha deve ter até 72 bytes.",
  );
export const registerSchema = z
  .object({ name: z.string().trim().min(2).max(100), email, password })
  .strict();
export const loginSchema = z
  .object({ email, password: z.string().min(1).max(200) })
  .strict();
export const idSchema = z.string().uuid("Identificador inválido.");
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export const vehicleQuery = pagination.extend({
  search: z.string().trim().max(100).optional(),
  category: z.nativeEnum(Category).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
});
export const rentalQuery = pagination.extend({
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
});
export const vehicleSchema = z
  .object({
    brand: z.string().trim().min(2).max(60),
    model: z.string().trim().min(1).max(80),
    year: z
      .number()
      .int()
      .min(1950)
      .max(new Date().getFullYear() + 1),
    plate: z
      .string()
      .trim()
      .toUpperCase()
      .transform((v) => v.replace("-", ""))
      .pipe(
        z
          .string()
          .regex(
            /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/,
            "Placa inválida. Use ABC1234 ou ABC1D23.",
          ),
      ),
    color: z.string().trim().min(2).max(40),
    category: z.nativeEnum(Category),
    dailyRate: z
      .string()
      .regex(
        /^\d{1,6}(\.\d{1,2})?$/,
        "Informe um valor com até duas casas decimais.",
      )
      .refine((v) => Number(v) > 0, "A diária deve ser positiva."),
    status: z.enum(["AVAILABLE", "MAINTENANCE"]).optional(),
    imageUrl: z
      .string()
      .url()
      .max(2048)
      .refine((v) => /^https?:\/\//.test(v), "Use uma URL HTTP ou HTTPS.")
      .nullable()
      .optional(),
  })
  .strict();
export const rentalSchema = z
  .object({
    vehicleId: idSchema,
    startDate: z
      .string()
      .datetime({ offset: true })
      .transform((v) => new Date(v)),
    expectedReturnDate: z
      .string()
      .datetime({ offset: true })
      .transform((v) => new Date(v)),
  })
  .strict()
  .refine(
    (v) => v.expectedReturnDate > v.startDate,
    "A devolução deve ser posterior ao início.",
  );
