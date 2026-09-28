import { describe, expect, it } from "vitest";
import { IncludeRelationship } from "../../../src/domain/relationship/include-relationship.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";

const DIAGRAM_ID = "diagram-1";

describe("IncludeRelationship", () => {
  it("é válida entre dois casos de uso", () => {
    const base = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const included = new UseCase("u2", "Validar Login", DIAGRAM_ID);
    const relationship = new IncludeRelationship("r1", DIAGRAM_ID, base, included);

    expect(relationship.validate().ok).toBe(true);
  });

  it("rejeita inclusão entre ator e caso de uso", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new IncludeRelationship("r1", DIAGRAM_ID, actor, useCase);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("INVALID_PAIR_FOR_INCLUDE");
  });

  it("rejeita inclusão entre dois atores", () => {
    const actor1 = new Actor("a1", "Cliente", DIAGRAM_ID);
    const actor2 = new Actor("a2", "Administrador", DIAGRAM_ID);
    const relationship = new IncludeRelationship("r1", DIAGRAM_ID, actor1, actor2);

    expect(relationship.validate().ok).toBe(false);
  });

  it("despacha para visitInclude ao aceitar um visitor", () => {
    const base = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const included = new UseCase("u2", "Validar Login", DIAGRAM_ID);
    const relationship = new IncludeRelationship("r1", DIAGRAM_ID, base, included);

    const visited = relationship.accept<string>({
      visitAssociation: () => "n/a",
      visitGeneralization: () => "n/a",
      visitInclude: (r) => `include:${r.id}`,
      visitExtend: () => "n/a",
    });

    expect(visited).toBe("include:r1");
  });
});
