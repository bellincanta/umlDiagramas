import { randomUUID } from "node:crypto";
import { DiagramNotFoundError } from "../domain/errors/domain-errors.js";
import { UseCase } from "../domain/usecase/use-case.js";
import type { DiagramRepository } from "../models/repositories/diagram.repository.js";
import type { UseCaseRepository } from "../models/repositories/use-case.repository.js";

export class UseCaseService {
  constructor(
    private readonly useCaseRepository: UseCaseRepository,
    private readonly diagramRepository: DiagramRepository,
  ) {}

  async addUseCase(diagramId: string, name: string): Promise<UseCase> {
    const diagramExists = await this.diagramRepository.exists(diagramId);
    if (!diagramExists) {
      throw new DiagramNotFoundError(diagramId);
    }

    const useCase = new UseCase(randomUUID(), name, diagramId);
    await this.useCaseRepository.create(useCase);
    return useCase;
  }

  async removeUseCase(diagramId: string, useCaseId: string): Promise<void> {
    await this.useCaseRepository.delete(diagramId, useCaseId);
  }
}
