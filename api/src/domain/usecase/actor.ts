import { DiagramElement } from "../diagram-element.js";

export class Actor extends DiagramElement {
  constructor(id: string, name: string, diagramId: string) {
    super(id, name, diagramId);
  }
}
