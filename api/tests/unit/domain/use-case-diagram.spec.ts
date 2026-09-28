import { describe, expect, it } from "vitest";
import { AssociationRelationship } from "../../../src/domain/relationship/association-relationship.js";
import { RelationshipRuleEngine } from "../../../src/domain/relationship/relationship-rule-engine.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";
import { UseCaseDiagram } from "../../../src/domain/usecase/use-case-diagram.js";

const DIAGRAM_ID = "diagram-1";

describe("UseCaseDiagram", () => {
  it("encontra um elemento por id, seja ator ou caso de uso", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    diagram.addActor(actor);
    diagram.addUseCase(useCase);

    expect(diagram.findElement("a1")).toBe(actor);
    expect(diagram.findElement("u1")).toBe(useCase);
    expect(diagram.findElement("inexistente")).toBeUndefined();
  });

  it("restaura um relacionamento já validado anteriormente sem revalidar", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    diagram.addActor(actor);
    diagram.addUseCase(useCase);

    diagram.restoreRelationship(new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase));

    expect(diagram.relationships).toHaveLength(1);
  });

  it("remove um relacionamento existente pelo id", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    diagram.addActor(actor);
    diagram.addUseCase(useCase);
    diagram.addRelationship(
      new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase),
      new RelationshipRuleEngine(),
    );

    diagram.removeRelationship("r1");

    expect(diagram.relationships).toHaveLength(0);
  });

  it("não falha ao tentar remover um relacionamento inexistente", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");

    expect(() => diagram.removeRelationship("inexistente")).not.toThrow();
  });
});
