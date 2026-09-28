import { describe, expect, it } from "vitest";
import { DomainError } from "../../../src/domain/errors/domain-errors.js";
import { Actor } from "../../../src/domain/usecase/actor.js";

describe("DiagramElement", () => {
  it("rejeita nome vazio", () => {
    expect(() => new Actor("a1", "   ", "diagram-1")).toThrow(DomainError);
  });
});
