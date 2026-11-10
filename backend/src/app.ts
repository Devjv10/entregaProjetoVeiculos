import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { vehicleRouter } from "./routes/vehicles.js";
import { rentalRouter } from "./routes/rentals.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { errorHandler } from "./middlewares/error.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_req, res) => res.json({ data: { status: "ok" } }));
app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/dashboard", dashboardRouter);
app.use((_req, res) =>
  res.status(404).json({ error: { message: "Rota não encontrada." } }),
);
app.use(errorHandler);
