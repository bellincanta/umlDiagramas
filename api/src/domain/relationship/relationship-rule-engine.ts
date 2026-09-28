import type { ValidationError, ValidationResult } from "../errors/domain-errors.js";
import type { Relationship } from "./relationship.js";

/**
 * Contrato mínimo que um diagrama precisa expor para que o engine valide um
 * relacionamento candidato, sem o engine depender da classe concreta de diagrama.
 */
export interface DiagramContext {
  readonly id: string;
  hasElement(elementId: string): boolean;
  hasDuplicateRelationship(relationship: Relationship): boolean;
}

export class RelationshipRuleEngine {
  validate(relationship: Relationship, diagram: DiagramContext): ValidationResult {
    const errors: ValidationError[] = [];

    const sourceExists = diagram.hasElement(relationship.source.id);
    const targetExists = diagram.hasElement(relationship.target.id);
    if (!sourceExists || !targetExists) {
      errors.push({
        code: "ELEMENT_NOT_FOUND",
        message: "Ator ou caso de uso referenciado não existe no diagrama.",
      });
      return { ok: false, errors };
    }

    const specific = relationship.validate();
    errors.push(...specific.errors);

    if (diagram.hasDuplicateRelationship(relationship)) {
      errors.push({
        code: "DUPLICATE_RELATIONSHIP",
        message: "Já existe um relacionamento idêntico entre estes elementos.",
      });
    }

    return { ok: errors.length === 0, errors };
  }
}
