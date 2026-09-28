import { describe, expect, it } from "vitest";
import { AssociationDirection, AssociationRelationship } from "../../../src/domain/relationship/association-relationship.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";

const DIAGRAM_ID = "diagram-1";

describe("AssociationRelationship", () => {
  it("é válida entre um ator e um caso de uso", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase, AssociationDirection.TO_USE_CASE);

    const result = relationship.validate();

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("é válida independentemente da ordem (caso de uso como origem)", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, useCase, actor, AssociationDirection.TO_ACTOR);

    const result = relationship.validate();

    expect(result.ok).toBe(true);
  });

  it("rejeita associação entre dois atores", () => {
    const actor1 = new Actor("a1", "Cliente", DIAGRAM_ID);
    const actor2 = new Actor("a2", "Administrador", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor1, actor2);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      { code: "INVALID_PAIR_FOR_ASSOCIATION", message: expect.any(String) },
    ]);
  });

  it("rejeita associação entre dois casos de uso", () => {
    const useCase1 = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const useCase2 = new UseCase("u2", "Validar Pagamento", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, useCase1, useCase2);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("INVALID_PAIR_FOR_ASSOCIATION");
  });

  it("rejeita autorrelacionamento", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor, actor);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain("SELF_RELATIONSHIP");
  });

  it("rejeita elementos de diagramas diferentes", () => {
    const actor = new Actor("a1", "Cliente", "outro-diagrama");
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase);

    const result = relationship.validate();

    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain("CROSS_DIAGRAM");
  });

  it("despacha para visitAssociation ao aceitar um visitor", () => {
    const actor = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const relationship = new AssociationRelationship("r1", DIAGRAM_ID, actor, useCase);

    const visited = relationship.accept({
      visitAssociation: (r) => `association:${r.id}`,
      visitGeneralization: () => "n/a",
      visitInclude: () => "n/a",
      visitExtend: () => "n/a",
    });

    expect(visited).toBe("association:r1");
  });
});
