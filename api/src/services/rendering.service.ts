import { DiagramNotFoundError } from "../domain/errors/domain-errors.js";
import type { UseCaseDiagram } from "../domain/usecase/use-case-diagram.js";
import type { DiagramRepository } from "../models/repositories/diagram.repository.js";
import type { AccessibleDescriptionDto } from "../views/dto/accessible-description.dto.js";
import type { DiagramJsonDto } from "../views/dto/diagram-response.dto.js";
import { AccessibleTextRenderer } from "../views/renderers/accessible-text-renderer.js";
import { JsonRenderer } from "../views/renderers/json-renderer.js";
import { UseCaseDiagramSvgRenderer } from "../views/renderers/use-case-diagram-svg-renderer.js";

export class RenderingService {
  private readonly jsonRenderer = new JsonRenderer();
  private readonly accessibleTextRenderer = new AccessibleTextRenderer();
  private readonly svgRenderer = new UseCaseDiagramSvgRenderer();

  constructor(private readonly diagramRepository: DiagramRepository) {}

  async renderJson(diagramId: string): Promise<DiagramJsonDto> {
    const diagram = await this.loadDiagram(diagramId);
    return this.jsonRenderer.render(diagram);
  }

  async renderAccessibleText(diagramId: string): Promise<AccessibleDescriptionDto> {
    const diagram = await this.loadDiagram(diagramId);
    return this.accessibleTextRenderer.render(diagram);
  }

  async renderDiagramSvg(diagramId: string): Promise<string> {
    const diagram = await this.loadDiagram(diagramId);
    return this.svgRenderer.render(diagram);
  }

  private async loadDiagram(diagramId: string): Promise<UseCaseDiagram> {
    const diagram = await this.diagramRepository.findFullById(diagramId);
    if (!diagram) {
      throw new DiagramNotFoundError(diagramId);
    }
    return diagram;
  }
}
