import { describe, expect, it } from "vitest";
import { GeneralizationRelationship } from "../../../src/domain/relationship/generalization-relationship.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";

const DIAGRAM_ID = "diagram-1";

describe("GeneralizationRelationship", () => {
  it("é válida entre dois atores", () => {
    const specific = new Actor("a1", "Cliente VIP", DIAGRAM_ID);
    const general = new Actor("a2", "Cliente", DIAGRAM_ID);
    const relationship = new GeneralizationRelationship("r1", DIAGRAM_ID, specific, general);

    expect(relationship.validate().ok).toBe(true);
  });

  it("é válida entre dois casos de uso", () => {
    const specific = new UseCase("u1", "Pagar com Cartão", DIAGRAM_ID);
    const general = new UseCase("u2", "Pagar", DIAGRAM_ID);
    const relationship = new GeneralizationRelationship("r1", DIAGRAM_ID, specific, general);

    expect(relationship.validate().ok).toBe(true);
  });

  it("rejeita generalização misturando ator e caso de uso", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new GeneralizationRelationship("r1", DIAGRAM_ID, actor, useCase);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("INVALID_PAIR_FOR_GENERALIZATION");
  });

  it("despacha para visitGeneralization ao aceitar um visitor", () => {
    const specific = new Actor("a1", "Cliente VIP", DIAGRAM_ID);
    const general = new Actor("a2", "Cliente", DIAGRAM_ID);
    const relationship = new GeneralizationRelationship("r1", DIAGRAM_ID, specific, general);

    const visited = relationship.accept<string>({
      visitAssociation: () => "n/a",
      visitGeneralization: (r) => `generalization:${r.id}`,
      visitInclude: () => "n/a",
      visitExtend: () => "n/a",
    });

    expect(visited).toBe("generalization:r1");
  });
});
