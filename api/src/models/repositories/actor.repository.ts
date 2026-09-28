import type { Actor } from "../../domain/usecase/actor.js";
import { prisma } from "../prisma/client.js";

export class ActorRepository {
  async create(actor: Actor): Promise<void> {
    await prisma.actor.create({
      data: { id: actor.id, name: actor.name, diagramId: actor.diagramId },
    });
  }

  async delete(diagramId: string, actorId: string): Promise<void> {
    await prisma.actor.delete({ where: { id: actorId, diagramId } });
  }
}
