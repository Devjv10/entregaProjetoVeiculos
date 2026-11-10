import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { idSchema, rentalQuery, rentalSchema } from "../schemas/index.js";
import {
  createRental,
  rentalInclude,
  returnRental,
} from "../services/rentals.js";
import { AppError } from "../utils/errors.js";

export const rentalRouter = Router();
rentalRouter.use(authenticate);

rentalRouter.post("/", authorize("CLIENTE"), async (req, res) => {
  res
    .status(201)
    .json({
      data: await createRental(req.user.id, rentalSchema.parse(req.body)),
    });
});

rentalRouter.get("/", async (req, res) => {
  const { page, limit, status } = rentalQuery.parse(req.query);
  const where = {
    status,
    ...(req.user.role === "ADMIN" ? {} : { userId: req.user.id }),
  };
  const [data, total] = await prisma.$transaction([
    prisma.rental.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      include: rentalInclude,
    }),
    prisma.rental.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

rentalRouter.get("/:id", async (req, res) => {
  const data = await prisma.rental.findFirst({
    where: {
      id: idSchema.parse(req.params.id),
      ...(req.user.role === "ADMIN" ? {} : { userId: req.user.id }),
    },
    include: rentalInclude,
  });
  if (!data) throw new AppError(404, "Locação não encontrada.");
  res.json({ data });
});

rentalRouter.patch("/:id/return", async (req, res) => {
  res.json({
    data: await returnRental(idSchema.parse(req.params.id), req.user),
  });
});
