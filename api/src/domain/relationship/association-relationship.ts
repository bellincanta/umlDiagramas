import type { DiagramElement } from "../diagram-element.js";
import type { ValidationResult } from "../errors/domain-errors.js";
import { Actor } from "../usecase/actor.js";
import { UseCase } from "../usecase/use-case.js";
import { Relationship, RelationshipKind } from "./relationship.js";
import type { RelationshipVisitor } from "./relationship-visitor.js";

export enum AssociationDirection {
  /** O ator fornece dados ao caso de uso. */
  TO_USE_CASE = "TO_USE_CASE",
  /** O caso de uso retorna informações ao ator. */
  TO_ACTOR = "TO_ACTOR",
  /** Navegabilidade não especificada (sem seta). */
  UNDIRECTED = "UNDIRECTED",
}

/** Único relacionamento possível entre Ator e Caso de Uso, sempre binário. */
export class AssociationRelationship extends Relationship {
  readonly kind = RelationshipKind.ASSOCIATION;
  readonly direction: AssociationDirection;

  constructor(
    id: string,
    diagramId: string,
    source: DiagramElement,
    target: DiagramElement,
    direction: AssociationDirection = AssociationDirection.UNDIRECTED,
  ) {
    super(id, diagramId, source, target);
    this.direction = direction;
  }

  protected validateSpecificRules(): ValidationResult {
    const isActorUseCasePair =
      (this.source instanceof Actor && this.target instanceof UseCase) ||
      (this.source instanceof UseCase && this.target instanceof Actor);

    if (!isActorUseCasePair) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_PAIR_FOR_ASSOCIATION",
            message: "Associação só pode existir entre um ator e um caso de uso.",
          },
        ],
      };
    }

    return { ok: true, errors: [] };
  }

  accept<T>(visitor: RelationshipVisitor<T>): T {
    return visitor.visitAssociation(this);
  }
}
