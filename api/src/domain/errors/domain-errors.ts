export interface ValidationError {
  code: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class InvalidRelationshipError extends Error {
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(errors.map((error) => error.message).join("; "));
    this.name = "InvalidRelationshipError";
    this.errors = errors;
  }
}

export class DiagramNotFoundError extends DomainError {
  constructor(diagramId: string) {
    super(`Diagrama "${diagramId}" não foi encontrado.`);
    this.name = "DiagramNotFoundError";
  }
}
