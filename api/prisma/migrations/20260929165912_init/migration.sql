-- CreateEnum
CREATE TYPE "DiagramType" AS ENUM ('USE_CASE');

-- CreateEnum
CREATE TYPE "RelationshipKind" AS ENUM ('ASSOCIATION', 'GENERALIZATION', 'INCLUDE', 'EXTEND');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('ACTOR', 'USE_CASE');

-- CreateEnum
CREATE TYPE "AssociationDirection" AS ENUM ('TO_USE_CASE', 'TO_ACTOR', 'UNDIRECTED');

-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DiagramType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,

    CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UseCase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,

    CONSTRAINT "UseCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "kind" "RelationshipKind" NOT NULL,
    "sourceType" "ElementType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" "ElementType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "direction" "AssociationDirection",
    "condition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Actor_diagramId_idx" ON "Actor"("diagramId");

-- CreateIndex
CREATE INDEX "UseCase_diagramId_idx" ON "UseCase"("diagramId");

-- CreateIndex
CREATE INDEX "Relationship_diagramId_idx" ON "Relationship"("diagramId");

-- CreateIndex
CREATE INDEX "Relationship_sourceType_sourceId_idx" ON "Relationship"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Relationship_targetType_targetId_idx" ON "Relationship"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseCase" ADD CONSTRAINT "UseCase_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
