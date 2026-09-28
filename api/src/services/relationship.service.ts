import { randomUUID } from "node:crypto";
import type { DiagramElement } from "../domain/diagram-element.js";
import { DiagramNotFoundError, InvalidRelationshipError } from "../domain/errors/domain-errors.js";
import { AssociationDirection, AssociationRelationship } from "../domain/relationship/association-relationship.js";
import { ExtendRelationship } from "../domain/relationship/extend-relationship.js";
import { GeneralizationRelationship } from "../domain/relationship/generalization-relationship.js";
import { IncludeRelationship } from "../domain/relationship/include-relationship.js";
import { Relationship, RelationshipKind } from "../domain/relationship/relationship.js";
import { RelationshipRuleEngine } from "../domain/relationship/relationship-rule-engine.js";
import type { DiagramRepository } from "../models/repositories/diagram.repository.js";
import type { RelationshipRepository } from "../models/repositories/relationship.repository.js";

export interface CreateRelationshipInput {
  kind: RelationshipKind;
  sourceId: string;
  targetId: string;
  direction?: AssociationDirection;
  condition?: string;
}

export class RelationshipService {
  private readonly ruleEngine = new RelationshipRuleEngine();

  constructor(
    private readonly diagramRepository: DiagramRepository,
    private readonly relationshipRepository: RelationshipRepository,
  ) {}

  async addRelationship(diagramId: string, input: CreateRelationshipInput): Promise<Relationship> {
    const diagram = await this.diagramRepository.findFullById(diagramId);
    if (!diagram) {
      throw new DiagramNotFoundError(diagramId);
    }

    const source = diagram.findElement(input.sourceId);
    const target = diagram.findElement(input.targetId);
    if (!source || !target) {
      throw new InvalidRelationshipError([
        { code: "ELEMENT_NOT_FOUND", message: "Ator ou caso de uso referenciado não existe no diagrama." },
      ]);
    }

    const relationship = this.buildRelationship(diagramId, input, source, target);
    // Lança InvalidRelationshipError automaticamente se o relacionamento violar
    // alguma regra de UML do RelationshipRuleEngine.
    diagram.addRelationship(relationship, this.ruleEngine);
    await this.relationshipRepository.create(relationship);
    return relationship;
  }

  async removeRelationship(diagramId: string, relationshipId: string): Promise<void> {
    await this.relationshipRepository.delete(diagramId, relationshipId);
  }

  private buildRelationship(
    diagramId: string,
    input: CreateRelationshipInput,
    source: DiagramElement,
    target: DiagramElement,
  ): Relationship {
    const id = randomUUID();
    switch (input.kind) {
      case RelationshipKind.ASSOCIATION:
        return new AssociationRelationship(
          id,
          diagramId,
          source,
          target,
          input.direction ?? AssociationDirection.UNDIRECTED,
        );
      case RelationshipKind.GENERALIZATION:
        return new GeneralizationRelationship(id, diagramId, source, target);
      case RelationshipKind.INCLUDE:
        return new IncludeRelationship(id, diagramId, source, target);
      case RelationshipKind.EXTEND:
        return new ExtendRelationship(id, diagramId, source, target, input.condition);
    }
  }
}
