import { describe, expect, it } from "vitest";
import { AssociationDirection, AssociationRelationship } from "../../../src/domain/relationship/association-relationship.js";
import { ExtendRelationship } from "../../../src/domain/relationship/extend-relationship.js";
import { RelationshipRuleEngine } from "../../../src/domain/relationship/relationship-rule-engine.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";
import { UseCaseDiagram } from "../../../src/domain/usecase/use-case-diagram.js";
import { JsonRenderer } from "../../../src/views/renderers/json-renderer.js";

const DIAGRAM_ID = "diagram-1";

describe("JsonRenderer", () => {
  it("serializa atores, casos de uso e relacionamentos, incluindo campos específicos por tipo", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");
    const engine = new RelationshipRuleEngine();

    const cliente = new Actor("a1", "Cliente", DIAGRAM_ID);
    const realizarPedido = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const pagarComCartao = new UseCase("u2", "Pagar com Cartão", DIAGRAM_ID);
    diagram.addActor(cliente);
    diagram.addUseCase(realizarPedido);
    diagram.addUseCase(pagarComCartao);

    diagram.addRelationship(
      new AssociationRelationship("r1", DIAGRAM_ID, cliente, realizarPedido, AssociationDirection.TO_USE_CASE),
      engine,
    );
    diagram.addRelationship(
      new ExtendRelationship("r2", DIAGRAM_ID, pagarComCartao, realizarPedido, "pagamento com cartão"),
      engine,
    );

    const dto = new JsonRenderer().render(diagram);

    expect(dto.id).toBe(DIAGRAM_ID);
    expect(dto.actors).toEqual([{ id: "a1", name: "Cliente" }]);
    expect(dto.useCases).toEqual([
      { id: "u1", name: "Realizar Pedido" },
      { id: "u2", name: "Pagar com Cartão" },
    ]);
    expect(dto.relationships).toEqual([
      {
        id: "r1",
        kind: "ASSOCIATION",
        sourceId: "a1",
        sourceType: "ACTOR",
        targetId: "u1",
        targetType: "USE_CASE",
        direction: AssociationDirection.TO_USE_CASE,
      },
      {
        id: "r2",
        kind: "EXTEND",
        sourceId: "u2",
        sourceType: "USE_CASE",
        targetId: "u1",
        targetType: "USE_CASE",
        condition: "pagamento com cartão",
      },
    ]);
  });
});
