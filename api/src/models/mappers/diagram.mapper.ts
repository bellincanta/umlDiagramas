import type {
  Actor as PrismaActorRecord,
  Diagram as PrismaDiagramRecord,
  ElementType,
  Relationship as PrismaRelationshipRecord,
  UseCase as PrismaUseCaseRecord,
} from "prisma-generated-client/client.js";
import type { DiagramElement } from "../../domain/diagram-element.js";
import { DomainError } from "../../domain/errors/domain-errors.js";
import { Actor } from "../../domain/usecase/actor.js";
import { UseCase } from "../../domain/usecase/use-case.js";
import { UseCaseDiagram } from "../../domain/usecase/use-case-diagram.js";
import { toDomainRelationship } from "./relationship.mapper.js";

export type DiagramWithRelations = PrismaDiagramRecord & {
  actors: PrismaActorRecord[];
  useCases: PrismaUseCaseRecord[];
  relationships: PrismaRelationshipRecord[];
};

export function toDomainUseCaseDiagram(record: DiagramWithRelations): UseCaseDiagram {
  const diagram = new UseCaseDiagram(record.id, record.title);

  for (const actorRecord of record.actors) {
    diagram.addActor(new Actor(actorRecord.id, actorRecord.name, actorRecord.diagramId));
  }
  for (const useCaseRecord of record.useCases) {
    diagram.addUseCase(new UseCase(useCaseRecord.id, useCaseRecord.name, useCaseRecord.diagramId));
  }
  for (const relationshipRecord of record.relationships) {
    const source = resolveElement(diagram, relationshipRecord.sourceType, relationshipRecord.sourceId);
    const target = resolveElement(diagram, relationshipRecord.targetType, relationshipRecord.targetId);
    diagram.restoreRelationship(toDomainRelationship(relationshipRecord, source, target));
  }

  return diagram;
}

function resolveElement(diagram: UseCaseDiagram, type: ElementType, id: string): DiagramElement {
  const element = diagram.findElement(id);
  if (!element) {
    throw new DomainError(
      `Inconsistência de dados: elemento ${type} "${id}" referenciado por um relacionamento não existe no diagrama.`,
    );
  }
  return element;
}
