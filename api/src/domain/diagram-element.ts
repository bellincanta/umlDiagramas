import { DomainError } from "./errors/domain-errors.js";

export abstract class DiagramElement {
  readonly id: string;
  readonly name: string;
  readonly diagramId: string;

  protected constructor(id: string, name: string, diagramId: string) {
    if (!name.trim()) {
      throw new DomainError("O nome do elemento não pode ser vazio.");
    }
    this.id = id;
    this.name = name;
    this.diagramId = diagramId;
  }
}
