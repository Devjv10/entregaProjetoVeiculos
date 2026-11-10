import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res
      .status(400)
      .json({
        error: {
          message: "Verifique os dados informados.",
          details: error.flatten(),
        },
      });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.status).json({ error: { message: error.message } });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const messages: Record<string, [number, string]> = {
      P2002: [409, "E-mail ou placa já cadastrado."],
      P2003: [
        409,
        "Este registro possui histórico associado e não pode ser excluído.",
      ],
      P2025: [404, "Registro não encontrado."],
      P2034: [
        409,
        "O registro foi alterado por outra solicitação. Tente novamente.",
      ],
    };
    const mapped = messages[error.code];
    if (mapped) {
      res.status(mapped[0]).json({ error: { message: mapped[1] } });
      return;
    }
  }
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: { message: "JSON inválido." } });
    return;
  }
  console.error(
    "Falha na API:",
    error instanceof Error ? error.name : "Erro desconhecido",
  );
  res
    .status(500)
    .json({
      error: {
        message: "Não foi possível concluir a operação. Tente novamente.",
      },
    });
};
