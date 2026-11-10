import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import type { Express } from "express";
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test")) {
  throw new Error(
    "Configure TEST_DATABASE_URL apontando para um banco MySQL cujo nome termine em _test e aplique as migrations antes de executar esta suíte.",
  );
}
process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET = randomBytes(48).toString("hex");
process.env.NODE_ENV = "test";

let app: Express;
let prisma: PrismaClient;
let clientToken: string;
let otherToken: string;
let adminToken: string;
let vehicleId: string;
let rentalId: string;
const run = randomUUID();
const password = randomBytes(18).toString("hex");
const email = `client-${run}@example.com`;
const userIds: string[] = [];
const vehicleIds: string[] = [];
const plate = `TST${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
const payload = {
  brand: "Teste",
  model: "Integração",
  year: 2025,
  plate,
  color: "Prata",
  category: "SEDAN",
  dailyRate: "123.45",
};
const auth = (token: string) => `Bearer ${token}`;
const rentalPayload = (id: string) => ({
  vehicleId: id,
  startDate: new Date().toISOString(),
  expectedReturnDate: new Date(Date.now() + 86_400_000).toISOString(),
});

beforeAll(async () => {
  ({ app } = await import("../src/app.js"));
  ({ prisma } = await import("../src/config/prisma.js"));
  await prisma.$connect();
  const admin = await prisma.user.create({
    data: {
      name: "Admin de teste",
      email: `admin-${run}@example.com`,
      password: await bcrypt.hash(password, 4),
      role: "ADMIN",
    },
  });
  userIds.push(admin.id);
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: admin.email, password });
  adminToken = adminLogin.body.data.token;
  const other = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Outro cliente",
      email: `other-${run}@example.com`,
      password,
    });
  userIds.push(other.body.data.user.id);
  otherToken = other.body.data.token;
}, 30000);

afterAll(async () => {
  if (!prisma) return;
  await prisma.rental.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.vehicle.deleteMany({ where: { id: { in: vehicleIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe("API com Prisma e MySQL reais", { concurrent: false }, () => {
  it("cadastra cliente sem retornar hash", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Cliente de teste", email, password });
    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe("CLIENTE");
    expect(response.body.data.user.password).toBeUndefined();
    userIds.push(response.body.data.user.id);
    clientToken = response.body.data.token;
  });
  it("faz login válido", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.password).toBeUndefined();
  });
  it("rejeita login inválido", async () => {
    expect(
      (
        await request(app)
          .post("/api/auth/login")
          .send({ email, password: "incorrect-password" })
      ).status,
    ).toBe(401);
  });
  it("protege rota sem autenticação", async () => {
    expect((await request(app).get("/api/vehicles")).status).toBe(401);
  });
  it("consulta usuário autenticado sem hash", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", auth(clientToken));
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
    expect(response.body.data.password).toBeUndefined();
  });
  it("impede cliente de cadastrar veículo", async () => {
    expect(
      (
        await request(app)
          .post("/api/vehicles")
          .set("Authorization", auth(clientToken))
          .send(payload)
      ).status,
    ).toBe(403);
  });
  it("permite cadastro de veículo por administrador", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", auth(adminToken))
      .send(payload);
    expect(response.status).toBe(201);
    vehicleId = response.body.data.id;
    vehicleIds.push(vehicleId);
  });
  it("impede placas duplicadas", async () => {
    expect(
      (
        await request(app)
          .post("/api/vehicles")
          .set("Authorization", auth(adminToken))
          .send(payload)
      ).status,
    ).toBe(409);
  });
  it("aluga veículo disponível e atualiza status", async () => {
    const response = await request(app)
      .post("/api/rentals")
      .set("Authorization", auth(clientToken))
      .send(rentalPayload(vehicleId));
    expect(response.status).toBe(201);
    expect(response.body.data.vehicle.status).toBe("RENTED");
    expect(response.body.data.contractedDailyRate).toBe("123.45");
    expect(response.body.data.user.password).toBeUndefined();
    rentalId = response.body.data.id;
  });
  it("impede locação de veículo indisponível", async () => {
    expect(
      (
        await request(app)
          .post("/api/rentals")
          .set("Authorization", auth(otherToken))
          .send(rentalPayload(vehicleId))
      ).status,
    ).toBe(409);
  });
  it("impede acessar ou devolver locação de outro cliente", async () => {
    expect(
      (
        await request(app)
          .get(`/api/rentals/${rentalId}`)
          .set("Authorization", auth(otherToken))
      ).status,
    ).toBe(404);
    expect(
      (
        await request(app)
          .patch(`/api/rentals/${rentalId}/return`)
          .set("Authorization", auth(otherToken))
      ).status,
    ).toBe(404);
    const listing = await request(app)
      .get("/api/rentals")
      .set("Authorization", auth(otherToken));
    expect(
      listing.body.data.some((r: { id: string }) => r.id === rentalId),
    ).toBe(false);
  });
  it("preserva a diária contratada após edição do preço", async () => {
    const edited = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", auth(adminToken))
      .send({ ...payload, dailyRate: "999.99" });
    expect(edited.status).toBe(200);
    const rental = await request(app)
      .get(`/api/rentals/${rentalId}`)
      .set("Authorization", auth(clientToken));
    expect(rental.body.data.contractedDailyRate).toBe("123.45");
  });
  it("impede liberação manual de veículo alugado", async () => {
    expect(
      (
        await request(app)
          .put(`/api/vehicles/${vehicleId}`)
          .set("Authorization", auth(adminToken))
          .send({ ...payload, status: "AVAILABLE" })
      ).status,
    ).toBe(409);
  });
  it("registra devolução e libera veículo", async () => {
    const response = await request(app)
      .patch(`/api/rentals/${rentalId}/return`)
      .set("Authorization", auth(clientToken));
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("COMPLETED");
    expect(response.body.data.vehicle.status).toBe("AVAILABLE");
    expect(response.body.data.finalTotal).toBe("123.45");
  });
  it("impede devolução duplicada", async () => {
    expect(
      (
        await request(app)
          .patch(`/api/rentals/${rentalId}/return`)
          .set("Authorization", auth(clientToken))
      ).status,
    ).toBe(409);
  });
  it("impede exclusão de veículo com histórico", async () => {
    expect(
      (
        await request(app)
          .delete(`/api/vehicles/${vehicleId}`)
          .set("Authorization", auth(adminToken))
      ).status,
    ).toBe(409);
  });
  it("aceita exatamente uma de duas locações simultâneas", async () => {
    const responses = await Promise.all(
      [clientToken, otherToken].map((token) =>
        request(app)
          .post("/api/rentals")
          .set("Authorization", auth(token))
          .send(rentalPayload(vehicleId)),
      ),
    );
    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    expect(
      await prisma.rental.count({ where: { vehicleId, status: "ACTIVE" } }),
    ).toBe(1);
    expect(
      (await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } }))
        .status,
    ).toBe("RENTED");
    rentalId = responses.find((response) => response.status === 201)!.body.data
      .id;
  });
  it("aceita exatamente uma de duas devoluções simultâneas", async () => {
    const responses = await Promise.all(
      [1, 2].map(() =>
        request(app)
          .patch(`/api/rentals/${rentalId}/return`)
          .set("Authorization", auth(adminToken)),
      ),
    );
    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 409,
    ]);
    expect(
      (await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } }))
        .status,
    ).toBe("AVAILABLE");
  });
  it("filtra indicadores do cliente por proprietário", async () => {
    const stats = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", auth(otherToken));
    expect(stats.status).toBe(200);
    const current = await request(app)
      .get("/api/auth/me")
      .set("Authorization", auth(otherToken));
    expect(
      stats.body.data.recentRentals.every(
        (r: { user: { id: string } }) =>
          r.user.id === current.body.data.id,
      ),
    ).toBe(true);
  });
});
