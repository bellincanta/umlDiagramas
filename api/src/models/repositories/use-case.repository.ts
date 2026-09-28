import type { UseCase } from "../../domain/usecase/use-case.js";
import { prisma } from "../prisma/client.js";

export class UseCaseRepository {
  async create(useCase: UseCase): Promise<void> {
    await prisma.useCase.create({
      data: { id: useCase.id, name: useCase.name, diagramId: useCase.diagramId },
    });
  }

  async delete(diagramId: string, useCaseId: string): Promise<void> {
    await prisma.useCase.delete({ where: { id: useCaseId, diagramId } });
  }
}
