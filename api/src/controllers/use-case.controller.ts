import { Router } from "express";
import { validateBody } from "../middlewares/validate-body.js";
import type { UseCaseService } from "../services/use-case.service.js";
import { createUseCaseSchema } from "../validation/use-case.schemas.js";

export function createUseCaseController(useCaseService: UseCaseService): Router {
  const router = Router({ mergeParams: true });

  router.post<{ diagramId: string }>("/", validateBody(createUseCaseSchema), async (req, res) => {
    const useCase = await useCaseService.addUseCase(req.params.diagramId, req.body.name);
    res.status(201).json({ id: useCase.id, name: useCase.name, diagramId: useCase.diagramId });
  });

  router.delete<{ diagramId: string; useCaseId: string }>("/:useCaseId", async (req, res) => {
    await useCaseService.removeUseCase(req.params.diagramId, req.params.useCaseId);
    res.status(204).send();
  });

  return router;
}
