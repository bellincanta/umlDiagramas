import { describe, expect, it } from "vitest";
import { AssociationRelationship } from "../../../src/domain/relationship/association-relationship.js";
import { RelationshipRuleEngine } from "../../../src/domain/relationship/relationship-rule-engine.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";
import { UseCaseDiagram } from "../../../src/domain/usecase/use-case-diagram.js";

const DIAGRAM_ID = "diagram-1";

function buildDiagram(): UseCaseDiagram {
  const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");
  diagram.addActor(new Actor("a1", "Cliente", DIAGRAM_ID));
  diagram.addUseCase(new UseCase("u1", "Realizar Pedido", DIAGRAM_ID));
  return diagram;
}

describe("RelationshipRuleEngine", () => {
  it("aceita um relacionamento válido", () => {
    const diagram = buildDiagram();
    const engine = new RelationshipRuleEngine();
    const actor = diagram.actors[0]!;
    const useCase = diagram.useCases[0]!;
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase);

    const result = engine.validate(relationship, diagram);

    expect(result.ok).toBe(true);
  });

  it("rejeita relacionamento com elemento inexistente no diagrama", () => {
    const diagram = buildDiagram();
    const engine = new RelationshipRuleEngine();
    const actor = diagram.actors[0]!;
    const useCaseFora = new UseCase("u-fora", "Cancelar Pedido", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor, useCaseFora);

    const result = engine.validate(relationship, diagram);

    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain("ELEMENT_NOT_FOUND");
  });

  it("rejeita relacionamento duplicado (mesmo par e mesmo tipo)", () => {
    const diagram = buildDiagram();
    const engine = new RelationshipRuleEngine();
    const actor = diagram.actors[0]!;
    const useCase = diagram.useCases[0]!;

    diagram.addRelationship(new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase), engine);
    const duplicate = new AssociationRelationship("r2", DIAGRAM_ID, actor, useCase);

    const result = engine.validate(duplicate, diagram);

    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain("DUPLICATE_RELATIONSHIP");
  });

  it("propaga erros de regra específica do tipo de relacionamento", () => {
    const diagram = buildDiagram();
    diagram.addActor(new Actor("a2", "Administrador", DIAGRAM_ID));
    const engine = new RelationshipRuleEngine();
    const actor1 = diagram.actors[0]!;
    const actor2 = diagram.actors[1]!;

    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor1, actor2);
    const result = engine.validate(relationship, diagram);

    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain("INVALID_PAIR_FOR_ASSOCIATION");
  });
});

describe("UseCaseDiagram.addRelationship", () => {
  it("lança InvalidRelationshipError quando o relacionamento é inválido", async () => {
    const { InvalidRelationshipError } = await import("../../../src/domain/errors/domain-errors.js");
    const diagram = buildDiagram();
    diagram.addActor(new Actor("a2", "Administrador", DIAGRAM_ID));
    const engine = new RelationshipRuleEngine();
    const actor1 = diagram.actors[0]!;
    const actor2 = diagram.actors[1]!;

    expect(() =>
      diagram.addRelationship(new AssociationRelationship("r1", DIAGRAM_ID, actor1, actor2), engine),
    ).toThrow(InvalidRelationshipError);
  });

  it("aceita e armazena um relacionamento válido", () => {
    const diagram = buildDiagram();
    const engine = new RelationshipRuleEngine();
    const actor = diagram.actors[0]!;
    const useCase = diagram.useCases[0]!;

    diagram.addRelationship(new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase), engine);

    expect(diagram.relationships).toHaveLength(1);
  });
});
