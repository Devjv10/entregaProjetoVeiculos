import type { Category } from "../types";

export const categories: Record<Category, string> = {
  ECONOMY: "Econômico",
  SEDAN: "Sedan",
  SUV: "SUV",
  HATCH: "Hatch",
  PICKUP: "Picape",
  LUXURY: "Luxo",
};
export const money = (value: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value),
  );
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
export const localDateTime = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
export function estimatedPrice(rate: string, days: number) {
  const [whole, fraction = ""] = rate.split(".");
  const cents =
    (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"))) * BigInt(days);
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}
