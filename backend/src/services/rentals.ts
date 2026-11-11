import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/errors.js";
import { rentalTotal, returnTotal } from "../utils/billing.js";

export const rentalInclude = {
  vehicle: true,
  user: { select: { id: true, name: true, email: true } },
} as const;

export async function createRental(
  userId: string,
  input: { vehicleId: string; startDate: Date; expectedReturnDate: Date },
) {
  const now = new Date();
  if (Math.abs(input.startDate.getTime() - now.getTime()) > 5 * 60_000) {
    throw new AppError(
      400,
      "A retirada é imediata. Atualize a data de início para o horário atual.",
    );
  }
  if (
    input.expectedReturnDate <= now ||
    input.expectedReturnDate.getTime() - now.getTime() > 365 * 86_400_000
  ) {
    throw new AppError(
      400,
      "A devolução deve ocorrer após a retirada e em até 365 dias.",
    );
  }
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.vehicle.updateMany({
      where: { id: input.vehicleId, status: "AVAILABLE" },
      data: { status: "RENTED" },
    });
    if (claimed.count !== 1)
      throw new AppError(409, "Veículo indisponível para locação.");
    const vehicle = await tx.vehicle.findUniqueOrThrow({
      where: { id: input.vehicleId },
    });
    return tx.rental.create({
      data: {
        userId,
        vehicleId: vehicle.id,
        startDate: now,
        expectedReturnDate: input.expectedReturnDate,
        contractedDailyRate: vehicle.dailyRate,
        estimatedTotal: rentalTotal(
          vehicle.dailyRate,
          now,
          input.expectedReturnDate,
        ),
      },
      include: rentalInclude,
    });
  });
}

export async function returnRental(
  id: string,
  user: { id: string; role: string },
) {
  return prisma.$transaction(async (tx) => {
    const rental = await tx.rental.findFirst({
      where: { id, ...(user.role === "ADMIN" ? {} : { userId: user.id }) },
    });
    if (!rental) throw new AppError(404, "Locação não encontrada.");
    const now = new Date();
    const completed = await tx.rental.updateMany({
      where: { id, status: "ACTIVE" },
      data: {
        status: "COMPLETED",
        actualReturnDate: now,
        finalTotal: returnTotal(
          rental.contractedDailyRate,
          rental.startDate,
          now,
        ),
      },
    });
    if (completed.count !== 1)
      throw new AppError(409, "Esta locação já foi devolvida.");
    await tx.vehicle.update({
      where: { id: rental.vehicleId },
      data: { status: "AVAILABLE" },
    });
    return tx.rental.findUniqueOrThrow({
      where: { id },
      include: rentalInclude,
    });
  });
}
