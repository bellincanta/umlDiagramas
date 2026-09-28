import { randomUUID } from "node:crypto";
import { DiagramNotFoundError } from "../domain/errors/domain-errors.js";
import { Actor } from "../domain/usecase/actor.js";
import type { ActorRepository } from "../models/repositories/actor.repository.js";
import type { DiagramRepository } from "../models/repositories/diagram.repository.js";

export class ActorService {
  constructor(
    private readonly actorRepository: ActorRepository,
    private readonly diagramRepository: DiagramRepository,
  ) {}

  async addActor(diagramId: string, name: string): Promise<Actor> {
    const diagramExists = await this.diagramRepository.exists(diagramId);
    if (!diagramExists) {
      throw new DiagramNotFoundError(diagramId);
    }

    const actor = new Actor(randomUUID(), name, diagramId);
    await this.actorRepository.create(actor);
    return actor;
  }

  async removeActor(diagramId: string, actorId: string): Promise<void> {
    await this.actorRepository.delete(diagramId, actorId);
  }
}
