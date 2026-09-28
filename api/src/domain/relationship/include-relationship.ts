import type { DiagramElement } from "../diagram-element.js";
import type { ValidationResult } from "../errors/domain-errors.js";
import { UseCase } from "../usecase/use-case.js";
import { Relationship, RelationshipKind } from "./relationship.js";
import type { RelationshipVisitor } from "./relationship-visitor.js";

/**
 * Inclusão (<<include>>), possível somente entre Casos de Uso.
 * Convenção: `source` é o caso de uso base, `target` é o caso de uso incluído.
 * Executar o base obriga a execução do incluído.
 */
export class IncludeRelationship extends Relationship {
  readonly kind = RelationshipKind.INCLUDE;

  constructor(id: string, diagramId: string, source: DiagramElement, target: DiagramElement) {
    super(id, diagramId, source, target);
  }

  protected validateSpecificRules(): ValidationResult {
    const bothUseCases = this.source instanceof UseCase && this.target instanceof UseCase;

    if (!bothUseCases) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_PAIR_FOR_INCLUDE",
            message: "Inclusão só pode existir entre dois casos de uso.",
          },
        ],
      };
    }

    return { ok: true, errors: [] };
  }

  accept<T>(visitor: RelationshipVisitor<T>): T {
    return visitor.visitInclude(this);
  }
}
