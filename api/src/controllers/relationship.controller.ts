import { Router } from "express";
import { validateBody } from "../middlewares/validate-body.js";
import type { RelationshipService } from "../services/relationship.service.js";
import { createRelationshipSchema } from "../validation/relationship.schemas.js";

export function createRelationshipController(relationshipService: RelationshipService): Router {
  const router = Router({ mergeParams: true });

  router.post<{ diagramId: string }>("/", validateBody(createRelationshipSchema), async (req, res) => {
    const relationship = await relationshipService.addRelationship(req.params.diagramId, {
      kind: req.body.type,
      sourceId: req.body.sourceId,
      targetId: req.body.targetId,
      direction: req.body.direction,
      condition: req.body.condition,
    });
    res.status(201).json({
      id: relationship.id,
      kind: relationship.kind,
      sourceId: relationship.source.id,
      targetId: relationship.target.id,
    });
  });

  router.delete<{ diagramId: string; relationshipId: string }>("/:relationshipId", async (req, res) => {
    await relationshipService.removeRelationship(req.params.diagramId, req.params.relationshipId);
    res.status(204).send();
  });

  return router;
}
