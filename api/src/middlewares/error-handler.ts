import type { NextFunction, Request, Response } from "express";
import { DiagramNotFoundError, DomainError, InvalidRelationshipError } from "../domain/errors/domain-errors.js";

/**
 * Converte erros de domínio em respostas HTTP. 422 é usado para violações de
 * regras semânticas de UML (payload bem formado, mas inválido para o
 * diagrama); 400 é reservado para erros de formato (ver validate-body.ts).
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof InvalidRelationshipError) {
    res.status(422).json({ errors: err.errors });
    return;
  }

  if (err instanceof DiagramNotFoundError) {
    res.status(404).json({ errors: [{ code: "DIAGRAM_NOT_FOUND", message: err.message }] });
    return;
  }

  if (err instanceof DomainError) {
    res.status(400).json({ errors: [{ code: "DOMAIN_ERROR", message: err.message }] });
    return;
  }

  if (isPrismaNotFoundError(err)) {
    res.status(404).json({ errors: [{ code: "NOT_FOUND", message: "Recurso não encontrado." }] });
    return;
  }

  console.error(err);
  res.status(500).json({ errors: [{ code: "INTERNAL_ERROR", message: "Erro interno do servidor." }] });
}

function isPrismaNotFoundError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2025";
}
