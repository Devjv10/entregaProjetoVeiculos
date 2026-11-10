import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { rentalDays, rentalTotal, returnTotal } from "../src/utils/billing.js";
import {
  registerSchema,
  rentalSchema,
  vehicleSchema,
} from "../src/schemas/index.js";

const start = new Date("2026-01-01T12:00:00Z");
const vehicle = {
  brand: "Toyota",
  model: "Corolla",
  year: 2025,
  plate: "ABC1D23",
  color: "Branco",
  category: "SEDAN",
  dailyRate: "199.90",
};

describe("Cobrança em diárias", () => {
  it("cobra uma diária para 24 horas exatas", () =>
    expect(rentalDays(start, new Date("2026-01-02T12:00:00Z"))).toBe(1));
  it("arredonda a fração seguinte para cima", () =>
    expect(rentalDays(start, new Date("2026-01-02T12:00:00.001Z"))).toBe(2));
  it("cobra no mínimo uma diária em devolução imediata", () =>
    expect(
      returnTotal(new Prisma.Decimal("99.90"), start, start).toFixed(2),
    ).toBe("99.90"));
  it("não acumula erros de ponto flutuante", () =>
    expect(
      rentalTotal("0.10", start, new Date("2026-01-04T12:00:00Z")).toFixed(2),
    ).toBe("0.30"));
  it("rejeita devolução anterior ao início", () =>
    expect(() =>
      rentalTotal("99.90", start, new Date("2025-12-31T12:00:00Z")),
    ).toThrow());
  it("rejeita datas iguais no contrato", () =>
    expect(() => rentalDays(start, start)).toThrow());
  it("calcula atrasos com a diária contratada", () =>
    expect(
      returnTotal(
        new Prisma.Decimal("150.25"),
        start,
        new Date("2026-01-04T12:01:00Z"),
      ).toFixed(2),
    ).toBe("601.00"));
});

describe("Validação de entradas", () => {
  it("normaliza o e-mail de cadastro", () =>
    expect(
      registerSchema.parse({
        name: "Ana Silva",
        email: " ANA@example.com ",
        password: "test-only-password",
      }).email,
    ).toBe("ana@example.com"));
  it("impede atribuição pública do perfil ADMIN", () =>
    expect(
      registerSchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        password: "test-only-password",
        role: "ADMIN",
      }).success,
    ).toBe(false));
  it("rejeita senhas acima do limite de bytes do bcrypt", () =>
    expect(
      registerSchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        password: "🔑".repeat(19),
      }).success,
    ).toBe(false));
  it("normaliza placa antiga com hífen", () =>
    expect(vehicleSchema.parse({ ...vehicle, plate: "abc-1234" }).plate).toBe(
      "ABC1234",
    ));
  it("rejeita placa inválida", () =>
    expect(
      vehicleSchema.safeParse({ ...vehicle, plate: "1234567" }).success,
    ).toBe(false));
  it("rejeita diária negativa e precisão excedente", () => {
    for (const dailyRate of ["-1", "1.999", "0"])
      expect(vehicleSchema.safeParse({ ...vehicle, dailyRate }).success).toBe(
        false,
      );
  });
  it("não permite marcar um veículo como alugado manualmente", () =>
    expect(
      vehicleSchema.safeParse({ ...vehicle, status: "RENTED" }).success,
    ).toBe(false));
  it("não aceita preço ou usuário enviados na locação", () =>
    expect(
      rentalSchema.safeParse({
        vehicleId: "b1eec1ad-3fd0-4d7b-ab42-264f495426d0",
        startDate: "2026-01-01T12:00:00Z",
        expectedReturnDate: "2026-01-02T12:00:00Z",
        userId: "another-user",
        estimatedTotal: "0.01",
      }).success,
    ).toBe(false));
});
