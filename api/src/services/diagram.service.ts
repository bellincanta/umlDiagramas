import { randomUUID } from "node:crypto";
import { DiagramNotFoundError } from "../domain/errors/domain-errors.js";
import type { UseCaseDiagram } from "../domain/usecase/use-case-diagram.js";
import type { DiagramRepository, DiagramSummary } from "../models/repositories/diagram.repository.js";

export class DiagramService {
  constructor(private readonly diagramRepository: DiagramRepository) {}

  async createDiagram(title: string): Promise<DiagramSummary> {
    return this.diagramRepository.create(randomUUID(), title);
  }

  async listDiagrams(): Promise<DiagramSummary[]> {
    return this.diagramRepository.findSummaries();
  }

  async getDiagramSummary(diagramId: string): Promise<DiagramSummary> {
    const summary = await this.diagramRepository.findSummaryById(diagramId);
    if (!summary) {
      throw new DiagramNotFoundError(diagramId);
    }
    return summary;
  }

  async getDiagram(diagramId: string): Promise<UseCaseDiagram> {
    const diagram = await this.diagramRepository.findFullById(diagramId);
    if (!diagram) {
      throw new DiagramNotFoundError(diagramId);
    }
    return diagram;
  }

  async deleteDiagram(diagramId: string): Promise<void> {
    const exists = await this.diagramRepository.exists(diagramId);
    if (!exists) {
      throw new DiagramNotFoundError(diagramId);
    }
    await this.diagramRepository.delete(diagramId);
  }
}
