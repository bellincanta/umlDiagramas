import {
  ElementType as PrismaElementType,
  type Relationship as PrismaRelationshipRecord,
  RelationshipKind as PrismaRelationshipKind,
} from "prisma-generated-client/client.js";
import type { DiagramElement } from "../../domain/diagram-element.js";
import { AssociationDirection, AssociationRelationship } from "../../domain/relationship/association-relationship.js";
import { ExtendRelationship } from "../../domain/relationship/extend-relationship.js";
import { GeneralizationRelationship } from "../../domain/relationship/generalization-relationship.js";
import { IncludeRelationship } from "../../domain/relationship/include-relationship.js";
import { Relationship, RelationshipKind } from "../../domain/relationship/relationship.js";
import { Actor } from "../../domain/usecase/actor.js";

const KIND_TO_PRISMA: Record<RelationshipKind, PrismaRelationshipKind> = {
  [RelationshipKind.ASSOCIATION]: PrismaRelationshipKind.ASSOCIATION,
  [RelationshipKind.GENERALIZATION]: PrismaRelationshipKind.GENERALIZATION,
  [RelationshipKind.INCLUDE]: PrismaRelationshipKind.INCLUDE,
  [RelationshipKind.EXTEND]: PrismaRelationshipKind.EXTEND,
};

export interface RelationshipPersistenceData {
  id: string;
  diagramId: string;
  kind: PrismaRelationshipKind;
  sourceType: PrismaElementType;
  sourceId: string;
  targetType: PrismaElementType;
  targetId: string;
  direction: AssociationDirection | null;
  condition: string | null;
}

export function toPersistenceData(relationship: Relationship): RelationshipPersistenceData {
  return {
    id: relationship.id,
    diagramId: relationship.diagramId,
    kind: KIND_TO_PRISMA[relationship.kind],
    sourceType: relationship.source instanceof Actor ? PrismaElementType.ACTOR : PrismaElementType.USE_CASE,
    sourceId: relationship.source.id,
    targetType: relationship.target instanceof Actor ? PrismaElementType.ACTOR : PrismaElementType.USE_CASE,
    targetId: relationship.target.id,
    direction: relationship instanceof AssociationRelationship ? relationship.direction : null,
    condition: relationship instanceof ExtendRelationship ? (relationship.condition ?? null) : null,
  };
}

export function toDomainRelationship(
  record: PrismaRelationshipRecord,
  source: DiagramElement,
  target: DiagramElement,
): Relationship {
  switch (record.kind) {
    case PrismaRelationshipKind.ASSOCIATION:
      return new AssociationRelationship(
        record.id,
        record.diagramId,
        source,
        target,
        (record.direction as AssociationDirection | null) ?? AssociationDirection.UNDIRECTED,
      );
    case PrismaRelationshipKind.GENERALIZATION:
      return new GeneralizationRelationship(record.id, record.diagramId, source, target);
    case PrismaRelationshipKind.INCLUDE:
      return new IncludeRelationship(record.id, record.diagramId, source, target);
    case PrismaRelationshipKind.EXTEND:
      return new ExtendRelationship(record.id, record.diagramId, source, target, record.condition ?? undefined);
  }
}
