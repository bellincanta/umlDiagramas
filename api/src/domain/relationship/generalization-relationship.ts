import type { DiagramElement } from "../diagram-element.js";
import type { ValidationResult } from "../errors/domain-errors.js";
import { Actor } from "../usecase/actor.js";
import { UseCase } from "../usecase/use-case.js";
import { Relationship, RelationshipKind } from "./relationship.js";
import type { RelationshipVisitor } from "./relationship-visitor.js";

/**
 * Generalização entre dois Atores OU entre dois Casos de Uso (nunca misto).
 * Convenção: `source` é o elemento específico, `target` é o elemento geral.
 */
export class GeneralizationRelationship extends Relationship {
  readonly kind = RelationshipKind.GENERALIZATION;

  constructor(id: string, diagramId: string, source: DiagramElement, target: DiagramElement) {
    super(id, diagramId, source, target);
  }

  protected validateSpecificRules(): ValidationResult {
    const bothActors = this.source instanceof Actor && this.target instanceof Actor;
    const bothUseCases = this.source instanceof UseCase && this.target instanceof UseCase;

    if (!bothActors && !bothUseCases) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_PAIR_FOR_GENERALIZATION",
            message:
              "Generalização só pode existir entre dois atores ou entre dois casos de uso, nunca misturando os dois tipos.",
          },
        ],
      };
    }

    return { ok: true, errors: [] };
  }

  accept<T>(visitor: RelationshipVisitor<T>): T {
    return visitor.visitGeneralization(this);
  }
}
