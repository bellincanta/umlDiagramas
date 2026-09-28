import type { DiagramElement } from "../diagram-element.js";
import type { ValidationError, ValidationResult } from "../errors/domain-errors.js";
import type { RelationshipVisitor } from "./relationship-visitor.js";

export enum RelationshipKind {
  ASSOCIATION = "ASSOCIATION",
  GENERALIZATION = "GENERALIZATION",
  INCLUDE = "INCLUDE",
  EXTEND = "EXTEND",
}

/**
 * Base de todo relacionamento UML. Combina Template Method (validate) com
 * Visitor (accept) — validação é responsabilidade de cada relacionamento,
 * renderização é responsabilidade de cada renderer (View).
 */
export abstract class Relationship {
  readonly id: string;
  readonly diagramId: string;
  readonly source: DiagramElement;
  readonly target: DiagramElement;

  protected constructor(id: string, diagramId: string, source: DiagramElement, target: DiagramElement) {
    this.id = id;
    this.diagramId = diagramId;
    this.source = source;
    this.target = target;
  }

  abstract readonly kind: RelationshipKind;

  validate(): ValidationResult {
    const structural = this.validateStructural();
    if (!structural.ok) {
      return structural;
    }
    return this.validateSpecificRules();
  }

  private validateStructural(): ValidationResult {
    const errors: ValidationError[] = [];

    if (this.source.id === this.target.id) {
      errors.push({
        code: "SELF_RELATIONSHIP",
        message: "Um elemento não pode se relacionar consigo mesmo.",
      });
    }

    if (this.source.diagramId !== this.diagramId || this.target.diagramId !== this.diagramId) {
      errors.push({
        code: "CROSS_DIAGRAM",
        message: "Os elementos relacionados devem pertencer ao mesmo diagrama.",
      });
    }

    return { ok: errors.length === 0, errors };
  }

  protected abstract validateSpecificRules(): ValidationResult;

  abstract accept<T>(visitor: RelationshipVisitor<T>): T;
}
