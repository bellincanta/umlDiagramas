import { Router } from "express";
import { validateBody } from "../middlewares/validate-body.js";
import type { DiagramService } from "../services/diagram.service.js";
import type { RenderingService } from "../services/rendering.service.js";
import { createDiagramSchema } from "../validation/diagram.schemas.js";

export function createDiagramController(diagramService: DiagramService, renderingService: RenderingService): Router {
  const router = Router();

  router.post("/", validateBody(createDiagramSchema), async (req, res) => {
    const diagram = await diagramService.createDiagram(req.body.title);
    res.status(201).json(diagram);
  });

  router.get("/", async (_req, res) => {
    const diagrams = await diagramService.listDiagrams();
    res.json(diagrams);
  });

  router.get<{ diagramId: string }>("/:diagramId", async (req, res) => {
    const dto = await renderingService.renderJson(req.params.diagramId);
    res.json(dto);
  });

  router.delete<{ diagramId: string }>("/:diagramId", async (req, res) => {
    await diagramService.deleteDiagram(req.params.diagramId);
    res.status(204).send();
  });

  return router;
}
