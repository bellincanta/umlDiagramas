import { DiagramElement } from "../diagram-element.js";

export class UseCase extends DiagramElement {
  constructor(id: string, name: string, diagramId: string) {
    super(id, name, diagramId);
  }
}
