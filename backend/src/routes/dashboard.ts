import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { rentalInclude } from "../services/rentals.js";

export const dashboardRouter = Router();
dashboardRouter.get("/stats", authenticate, async (req, res) => {
  const scope = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
  const [
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    activeRentals,
    completedRentals,
    recentRentals,
    available,
  ] = await prisma.$transaction([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    req.user.role === "ADMIN"
      ? prisma.vehicle.count({ where: { status: "RENTED" } })
      : prisma.rental.count({ where: { ...scope, status: "ACTIVE" } }),
    prisma.rental.count({ where: { ...scope, status: "ACTIVE" } }),
    prisma.rental.count({ where: { ...scope, status: "COMPLETED" } }),
    prisma.rental.findMany({
      where: scope,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: rentalInclude,
    }),
    prisma.vehicle.findMany({
      where: { status: "AVAILABLE" },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({
    data: {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      activeRentals,
      completedRentals,
      recentRentals,
      availableVehiclesList: available,
    },
  });
});
