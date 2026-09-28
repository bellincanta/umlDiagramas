import { Router } from "express";
import type { RenderingService } from "../services/rendering.service.js";

export function createRenderController(renderingService: RenderingService): Router {
  const router = Router({ mergeParams: true });

  router.get<{ diagramId: string }>("/svg", async (req, res) => {
    const svg = await renderingService.renderDiagramSvg(req.params.diagramId);
    // text/plain permite curl, download direto e uso via innerHTML no frontend;
    // navegadores reconhecem o conteúdo como SVG pelo marcador <svg ...>.
    res.type("text/plain; charset=utf-8").send(svg);
  });

  router.get<{ diagramId: string }>("/text", async (req, res) => {
    const description = await renderingService.renderAccessibleText(req.params.diagramId);
    res.json(description);
  });

  router.get<{ diagramId: string }>("/json", async (req, res) => {
    const dto = await renderingService.renderJson(req.params.diagramId);
    res.json(dto);
  });

  return router;
}
