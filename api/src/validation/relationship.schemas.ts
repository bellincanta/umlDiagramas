import { z } from "zod";
import { AssociationDirection } from "../domain/relationship/association-relationship.js";
import { RelationshipKind } from "../domain/relationship/relationship.js";

export const createRelationshipSchema = z.object({
  type: z.nativeEnum(RelationshipKind),
  sourceId: z.string().trim().min(1, "sourceId é obrigatório."),
  targetId: z.string().trim().min(1, "targetId é obrigatório."),
  direction: z.nativeEnum(AssociationDirection).optional(),
  condition: z.string().trim().min(1).optional(),
});
