import { Prisma } from "@prisma/client";
import { AppError } from "./errors.js";

export function rentalDays(start: Date, end: Date): number {
  const duration = end.getTime() - start.getTime();
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new AppError(400, "A devolução deve ser posterior ao início.");
  }
  return Math.ceil(duration / 86_400_000);
}

export function rentalTotal(
  rate: Prisma.Decimal | string,
  start: Date,
  end: Date,
) {
  return new Prisma.Decimal(rate)
    .mul(rentalDays(start, end))
    .toDecimalPlaces(2);
}

export function returnTotal(
  rate: Prisma.Decimal,
  start: Date,
  returnedAt: Date,
) {
  return rate
    .mul(
      Math.max(
        1,
        Math.ceil((returnedAt.getTime() - start.getTime()) / 86_400_000),
      ),
    )
    .toDecimalPlaces(2);
}
