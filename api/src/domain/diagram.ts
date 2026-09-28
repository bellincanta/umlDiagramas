export enum DiagramType {
  USE_CASE = "USE_CASE",
}

/** Ponto de extensão para futuros tipos de diagrama (ex.: classes, sequência). */
export abstract class Diagram {
  readonly id: string;
  readonly title: string;

  protected constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }

  abstract readonly diagramType: DiagramType;
}
