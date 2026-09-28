import { describe, expect, it } from "vitest";
import { ExtendRelationship } from "../../../src/domain/relationship/extend-relationship.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";

const DIAGRAM_ID = "diagram-1";

describe("ExtendRelationship", () => {
  it("é válida entre dois casos de uso, com condição opcional", () => {
    const extension = new UseCase("u1", "Pagar com Cartão", DIAGRAM_ID);
    const base = new UseCase("u2", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new ExtendRelationship(
      "r1",
      DIAGRAM_ID,
      extension,
      base,
      "forma de pagamento selecionada seja cartão",
    );

    const result = relationship.validate();

    expect(result.ok).toBe(true);
    expect(relationship.condition).toBe("forma de pagamento selecionada seja cartão");
  });

  it("rejeita extensão entre ator e caso de uso", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new ExtendRelationship("r1", DIAGRAM_ID, actor, useCase);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("INVALID_PAIR_FOR_EXTEND");
  });

  it("despacha para visitExtend ao aceitar um visitor", () => {
    const extension = new UseCase("u1", "Pagar com Cartão", DIAGRAM_ID);
    const base = new UseCase("u2", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new ExtendRelationship("r1", DIAGRAM_ID, extension, base);

    const visited = relationship.accept({
      visitAssociation: () => "n/a",
      visitGeneralization: () => "n/a",
      visitInclude: () => "n/a",
      visitExtend: (r) => `extend:${r.id}`,
    });

    expect(visited).toBe("extend:r1");
  });
});
