import { Router } from "express";
import { createActorController } from "../controllers/actor.controller.js";
import { createDiagramController } from "../controllers/diagram.controller.js";
import { createRelationshipController } from "../controllers/relationship.controller.js";
import { createRenderController } from "../controllers/render.controller.js";
import { createUseCaseController } from "../controllers/use-case.controller.js";
import { ActorRepository } from "../models/repositories/actor.repository.js";
import { DiagramRepository } from "../models/repositories/diagram.repository.js";
import { RelationshipRepository } from "../models/repositories/relationship.repository.js";
import { UseCaseRepository } from "../models/repositories/use-case.repository.js";
import { ActorService } from "../services/actor.service.js";
import { DiagramService } from "../services/diagram.service.js";
import { RelationshipService } from "../services/relationship.service.js";
import { RenderingService } from "../services/rendering.service.js";
import { UseCaseService } from "../services/use-case.service.js";

export function createApiRouter(): Router {
  const diagramRepository = new DiagramRepository();
  const actorRepository = new ActorRepository();
  const useCaseRepository = new UseCaseRepository();
  const relationshipRepository = new RelationshipRepository();

  const diagramService = new DiagramService(diagramRepository);
  const actorService = new ActorService(actorRepository, diagramRepository);
  const useCaseService = new UseCaseService(useCaseRepository, diagramRepository);
  const relationshipService = new RelationshipService(diagramRepository, relationshipRepository);
  const renderingService = new RenderingService(diagramRepository);

  const router = Router();

  router.use("/diagrams", createDiagramController(diagramService, renderingService));
  router.use("/diagrams/:diagramId/actors", createActorController(actorService));
  router.use("/diagrams/:diagramId/use-cases", createUseCaseController(useCaseService));
  router.use("/diagrams/:diagramId/relationships", createRelationshipController(relationshipService));
  router.use("/diagrams/:diagramId/render", createRenderController(renderingService));

  return router;
}
