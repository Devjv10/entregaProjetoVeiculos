import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { idSchema, vehicleQuery, vehicleSchema } from "../schemas/index.js";
import { AppError } from "../utils/errors.js";

export const vehicleRouter = Router();
vehicleRouter.use(authenticate);

vehicleRouter.get("/", async (req, res) => {
  const { page, limit, search, status, category } = vehicleQuery.parse(
    req.query,
  );
  const where = {
    status,
    category,
    ...(search
      ? {
          OR: [
            { brand: { contains: search } },
            { model: { contains: search } },
          ],
        }
      : {}),
  };
  const [data, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),
    prisma.vehicle.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

vehicleRouter.get("/:id", async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: idSchema.parse(req.params.id) },
  });
  if (!vehicle) throw new AppError(404, "Veículo não encontrado.");
  res.json({ data: vehicle });
});

vehicleRouter.post("/", authorize("ADMIN"), async (req, res) => {
  const data = vehicleSchema.parse(req.body);
  res.status(201).json({ data: await prisma.vehicle.create({ data }) });
});

vehicleRouter.put("/:id", authorize("ADMIN"), async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const input = vehicleSchema.parse(req.body);
  const data = await prisma.$transaction(async (tx) => {
    const changed = await tx.vehicle.updateMany({
      where: {
        id,
        ...(input.status ? { status: { not: "RENTED" as const } } : {}),
      },
      data: input,
    });
    if (!changed.count) {
      const existing = await tx.vehicle.findUnique({ where: { id } });
      if (!existing) throw new AppError(404, "Veículo não encontrado.");
      throw new AppError(
        409,
        "O status de um veículo alugado só muda pela devolução.",
      );
    }
    return tx.vehicle.findUniqueOrThrow({ where: { id } });
  });
  res.json({ data });
});

vehicleRouter.delete("/:id", authorize("ADMIN"), async (req, res) => {
  const id = idSchema.parse(req.params.id);
  await prisma.$transaction(async (tx) => {
    const history = await tx.rental.count({ where: { vehicleId: id } });
    if (history)
      throw new AppError(
        409,
        "Veículos com histórico de locações não podem ser excluídos.",
      );
    await tx.vehicle.delete({ where: { id } });
  });
  res.json({ data: { message: "Veículo excluído." } });
});
