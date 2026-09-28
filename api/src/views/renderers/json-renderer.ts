import type { AssociationRelationship } from "../../domain/relationship/association-relationship.js";
import type { ExtendRelationship } from "../../domain/relationship/extend-relationship.js";
import type { GeneralizationRelationship } from "../../domain/relationship/generalization-relationship.js";
import type { IncludeRelationship } from "../../domain/relationship/include-relationship.js";
import type { Relationship } from "../../domain/relationship/relationship.js";
import type { RelationshipVisitor } from "../../domain/relationship/relationship-visitor.js";
import { Actor } from "../../domain/usecase/actor.js";
import type { UseCaseDiagram } from "../../domain/usecase/use-case-diagram.js";
import type { DiagramJsonDto, RelationshipJsonDto } from "../dto/diagram-response.dto.js";

export class JsonRenderer implements RelationshipVisitor<RelationshipJsonDto> {
  render(diagram: UseCaseDiagram): DiagramJsonDto {
    return {
      id: diagram.id,
      title: diagram.title,
      actors: diagram.actors.map((actor) => ({ id: actor.id, name: actor.name })),
      useCases: diagram.useCases.map((useCase) => ({ id: useCase.id, name: useCase.name })),
      relationships: diagram.relationships.map((relationship) => relationship.accept(this)),
    };
  }

  visitAssociation(relationship: AssociationRelationship): RelationshipJsonDto {
    return this.toDto(relationship, { direction: relationship.direction });
  }

  visitGeneralization(relationship: GeneralizationRelationship): RelationshipJsonDto {
    return this.toDto(relationship);
  }

  visitInclude(relationship: IncludeRelationship): RelationshipJsonDto {
    return this.toDto(relationship);
  }

  visitExtend(relationship: ExtendRelationship): RelationshipJsonDto {
    return this.toDto(relationship, relationship.condition ? { condition: relationship.condition } : {});
  }

  private toDto(relationship: Relationship, extra: Partial<RelationshipJsonDto> = {}): RelationshipJsonDto {
    return {
      id: relationship.id,
      kind: relationship.kind,
      sourceId: relationship.source.id,
      sourceType: relationship.source instanceof Actor ? "ACTOR" : "USE_CASE",
      targetId: relationship.target.id,
      targetType: relationship.target instanceof Actor ? "ACTOR" : "USE_CASE",
      ...extra,
    };
  }
}
