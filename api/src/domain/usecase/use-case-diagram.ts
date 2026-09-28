import type { DiagramElement } from "../diagram-element.js";
import { Diagram, DiagramType } from "../diagram.js";
import { InvalidRelationshipError } from "../errors/domain-errors.js";
import type { DiagramContext, RelationshipRuleEngine } from "../relationship/relationship-rule-engine.js";
import { Relationship } from "../relationship/relationship.js";
import type { Actor } from "./actor.js";
import type { UseCase } from "./use-case.js";

export class UseCaseDiagram extends Diagram implements DiagramContext {
  readonly diagramType = DiagramType.USE_CASE;

  private readonly actorsById = new Map<string, Actor>();
  private readonly useCasesById = new Map<string, UseCase>();
  private readonly relationshipList: Relationship[] = [];

  constructor(id: string, title: string) {
    super(id, title);
  }

  get actors(): readonly Actor[] {
    return [...this.actorsById.values()];
  }

  get useCases(): readonly UseCase[] {
    return [...this.useCasesById.values()];
  }

  get relationships(): readonly Relationship[] {
    return [...this.relationshipList];
  }

  addActor(actor: Actor): void {
    this.actorsById.set(actor.id, actor);
  }

  addUseCase(useCase: UseCase): void {
    this.useCasesById.set(useCase.id, useCase);
  }

  /** Reconstrói um relacionamento já validado anteriormente (ex.: vindo da persistência). */
  restoreRelationship(relationship: Relationship): void {
    this.relationshipList.push(relationship);
  }

  /** Valida e adiciona um relacionamento novo. Lança InvalidRelationshipError se inválido. */
  addRelationship(relationship: Relationship, ruleEngine: RelationshipRuleEngine): void {
    const result = ruleEngine.validate(relationship, this);
    if (!result.ok) {
      throw new InvalidRelationshipError(result.errors);
    }
    this.relationshipList.push(relationship);
  }

  removeRelationship(relationshipId: string): void {
    const index = this.relationshipList.findIndex((relationship) => relationship.id === relationshipId);
    if (index !== -1) {
      this.relationshipList.splice(index, 1);
    }
  }

  findElement(elementId: string): DiagramElement | undefined {
    return this.actorsById.get(elementId) ?? this.useCasesById.get(elementId);
  }

  hasElement(elementId: string): boolean {
    return this.actorsById.has(elementId) || this.useCasesById.has(elementId);
  }

  hasDuplicateRelationship(relationship: Relationship): boolean {
    return this.relationshipList.some(
      (existing) =>
        existing.kind === relationship.kind &&
        existing.source.id === relationship.source.id &&
        existing.target.id === relationship.target.id,
    );
  }
}
