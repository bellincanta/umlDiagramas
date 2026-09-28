import { Router } from "express";
import { validateBody } from "../middlewares/validate-body.js";
import type { ActorService } from "../services/actor.service.js";
import { createActorSchema } from "../validation/actor.schemas.js";

export function createActorController(actorService: ActorService): Router {
  const router = Router({ mergeParams: true });

  router.post<{ diagramId: string }>("/", validateBody(createActorSchema), async (req, res) => {
    const actor = await actorService.addActor(req.params.diagramId, req.body.name);
    res.status(201).json({ id: actor.id, name: actor.name, diagramId: actor.diagramId });
  });

  router.delete<{ diagramId: string; actorId: string }>("/:actorId", async (req, res) => {
    await actorService.removeActor(req.params.diagramId, req.params.actorId);
    res.status(204).send();
  });

  return router;
}
