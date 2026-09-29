import { DiagramType as PrismaDiagramType } from "../../generated/prisma/client.js";
import type { UseCaseDiagram } from "../../domain/usecase/use-case-diagram.js";
import { toDomainUseCaseDiagram } from "../mappers/diagram.mapper.js";
import { prisma } from "../prisma/client.js";

export interface DiagramSummary {
  id: string;
  title: string;
  type: PrismaDiagramType;
  createdAt: Date;
  updatedAt: Date;
}

export class DiagramRepository {
  async create(id: string, title: string): Promise<DiagramSummary> {
    return prisma.diagram.create({ data: { id, title, type: PrismaDiagramType.USE_CASE } });
  }

  async findSummaries(): Promise<DiagramSummary[]> {
    return prisma.diagram.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findSummaryById(id: string): Promise<DiagramSummary | null> {
    return prisma.diagram.findUnique({ where: { id } });
  }

  async findFullById(id: string): Promise<UseCaseDiagram | null> {
    const record = await prisma.diagram.findUnique({
      where: { id },
      include: { actors: true, useCases: true, relationships: true },
    });
    if (!record) {
      return null;
    }
    return toDomainUseCaseDiagram(record);
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.diagram.count({ where: { id } });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await prisma.diagram.delete({ where: { id } });
  }
}
