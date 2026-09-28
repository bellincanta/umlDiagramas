import type { DiagramElement } from "../diagram-element.js";
import type { ValidationResult } from "../errors/domain-errors.js";
import { UseCase } from "../usecase/use-case.js";
import { Relationship, RelationshipKind } from "./relationship.js";
import type { RelationshipVisitor } from "./relationship-visitor.js";

/**
 * Extensão (<<extend>>), possível somente entre Casos de Uso.
 * Convenção: `source` é o caso de uso de extensão (opcional), `target` é o
 * caso de uso base. `condition` descreve em texto livre a condição que
 * habilita a extensão.
 */
export class ExtendRelationship extends Relationship {
  readonly kind = RelationshipKind.EXTEND;
  readonly condition?: string;

  constructor(
    id: string,
    diagramId: string,
    source: DiagramElement,
    target: DiagramElement,
    condition?: string,
  ) {
    super(id, diagramId, source, target);
    this.condition = condition;
  }

  protected validateSpecificRules(): ValidationResult {
    const bothUseCases = this.source instanceof UseCase && this.target instanceof UseCase;

    if (!bothUseCases) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_PAIR_FOR_EXTEND",
            message: "Extensão só pode existir entre dois casos de uso.",
          },
        ],
      };
    }

    return { ok: true, errors: [] };
  }

  accept<T>(visitor: RelationshipVisitor<T>): T {
    return visitor.visitExtend(this);
  }
}
