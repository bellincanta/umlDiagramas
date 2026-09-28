import type { Relationship } from "../../domain/relationship/relationship.js";
import { toPersistenceData } from "../mappers/relationship.mapper.js";
import { prisma } from "../prisma/client.js";

export class RelationshipRepository {
  async create(relationship: Relationship): Promise<void> {
    const data = toPersistenceData(relationship);
    await prisma.relationship.create({ data });
  }

  async delete(diagramId: string, relationshipId: string): Promise<void> {
    await prisma.relationship.delete({ where: { id: relationshipId, diagramId } });
  }
}
