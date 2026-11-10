import "dotenv/config";
import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { password, email } from "../src/schemas/index.js";

const settings = z
  .object({
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: password,
    ADMIN_NAME: z.string().min(2).default("Administrador"),
  })
  .parse(process.env);
const prisma = new PrismaClient();

try {
  const existing = await prisma.user.findUnique({
    where: { email: settings.ADMIN_EMAIL },
  });
  if (existing && existing.role !== "ADMIN")
    throw new Error(
      "O e-mail informado já pertence a um cliente. Use outro e-mail.",
    );
  await prisma.user.upsert({
    where: { email: settings.ADMIN_EMAIL },
    update: {},
    create: {
      name: settings.ADMIN_NAME,
      email: settings.ADMIN_EMAIL,
      password: await bcrypt.hash(settings.ADMIN_PASSWORD, 12),
      role: "ADMIN",
    },
  });
  if (process.env.SEED_DEMO === "true") {
    const vehicles = [
      {
        brand: "Volkswagen",
        model: "Polo",
        year: 2025,
        plate: "DEM1A01",
        color: "Prata",
        category: Category.HATCH,
        dailyRate: "149.90",
      },
      {
        brand: "Toyota",
        model: "Corolla",
        year: 2025,
        plate: "DEM1A02",
        color: "Branco",
        category: Category.SEDAN,
        dailyRate: "229.90",
      },
      {
        brand: "Jeep",
        model: "Compass",
        year: 2025,
        plate: "DEM1A03",
        color: "Cinza",
        category: Category.SUV,
        dailyRate: "329.90",
      },
      {
        brand: "Fiat",
        model: "Mobi",
        year: 2024,
        plate: "DEM1A04",
        color: "Branco",
        category: Category.ECONOMY,
        dailyRate: "109.90",
      },
      {
        brand: "Toyota",
        model: "Hilux",
        year: 2025,
        plate: "DEM1A05",
        color: "Preto",
        category: Category.PICKUP,
        dailyRate: "459.90",
      },
      {
        brand: "BMW",
        model: "320i",
        year: 2025,
        plate: "DEM1A06",
        color: "Azul",
        category: Category.LUXURY,
        dailyRate: "649.90",
      },
    ];
    for (const vehicle of vehicles)
      await prisma.vehicle.upsert({
        where: { plate: vehicle.plate },
        update: {},
        create: vehicle,
      });
  }
  console.log("Seed concluído. Registros existentes foram preservados.");
} finally {
  await prisma.$disconnect();
}
