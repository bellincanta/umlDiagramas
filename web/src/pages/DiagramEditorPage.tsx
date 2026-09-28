import { Link, useParams } from "react-router-dom";
import { useLiveAnnouncer } from "../accessibility/LiveAnnouncerContext";
import { useDeleteActorMutation } from "../api/actors";
import { useDiagramQuery } from "../api/diagrams";
import { ApiError } from "../api/http";
import { useDeleteRelationshipMutation } from "../api/relationships";
import type { DiagramDetail, RelationshipDto, RelationshipKind } from "../api/types";
import { useDeleteUseCaseMutation } from "../api/useCases";
import { AccessibleDescriptionPanel } from "../components/AccessibleDescriptionPanel";
import { ActorForm } from "../components/ActorForm";
import { ElementList } from "../components/ElementList";
import { DiagramSvgViewer } from "../components/DiagramSvgViewer";
import { RelationshipForm } from "../components/RelationshipForm";
import { UseCaseForm } from "../components/UseCaseForm";

const KIND_LABELS: Record<RelationshipKind, string> = {
  ASSOCIATION: "Associação",
  GENERALIZATION: "Generalização",
  INCLUDE: "Inclusão",
  EXTEND: "Extensão",
};

function elementName(diagram: DiagramDetail, elementId: string): string {
  return (
    diagram.actors.find((actor) => actor.id === elementId)?.name ??
    diagram.useCases.find((useCase) => useCase.id === elementId)?.name ??
    elementId
  );
}

function describeRelationship(diagram: DiagramDetail, relationship: RelationshipDto): string {
  return `${KIND_LABELS[relationship.kind]}: ${elementName(diagram, relationship.sourceId)} → ${elementName(diagram, relationship.targetId)}`;
}

export function DiagramEditorPage() {
  const { diagramId } = useParams<{ diagramId: string }>();
  const { announce } = useLiveAnnouncer();
  const { data: diagram, isLoading, isError } = useDiagramQuery(diagramId ?? "");
  const deleteActor = useDeleteActorMutation(diagramId ?? "");
  const deleteUseCase = useDeleteUseCaseMutation(diagramId ?? "");
  const deleteRelationship = useDeleteRelationshipMutation(diagramId ?? "");

  if (!diagramId) {
    return <p role="alert">Diagrama não especificado.</p>;
  }

  if (isLoading) {
    return <p>Carregando diagrama...</p>;
  }

  if (isError || !diagram) {
    return <p role="alert">Não foi possível carregar este diagrama.</p>;
  }

  async function handleDeleteActor(actorId: string): Promise<void> {
    const actor = diagram!.actors.find((candidate) => candidate.id === actorId);
    try {
      await deleteActor.mutateAsync(actorId);
      announce(`Ator "${actor?.name ?? ""}" removido.`);
    } catch (err) {
      announce(`Erro ao remover ator: ${err instanceof ApiError ? err.message : "erro desconhecido"}`);
    }
  }

  async function handleDeleteUseCase(useCaseId: string): Promise<void> {
    const useCase = diagram!.useCases.find((candidate) => candidate.id === useCaseId);
    try {
      await deleteUseCase.mutateAsync(useCaseId);
      announce(`Caso de uso "${useCase?.name ?? ""}" removido.`);
    } catch (err) {
      announce(`Erro ao remover caso de uso: ${err instanceof ApiError ? err.message : "erro desconhecido"}`);
    }
  }

  async function handleDeleteRelationship(relationshipId: string): Promise<void> {
    try {
      await deleteRelationship.mutateAsync(relationshipId);
      announce("Relacionamento removido.");
    } catch (err) {
      announce(`Erro ao remover relacionamento: ${err instanceof ApiError ? err.message : "erro desconhecido"}`);
    }
  }

  return (
    <main id="main-content">
      <p>
        <Link to="/">&larr; Voltar para a lista de diagramas</Link>
      </p>
      <h1>{diagram.title}</h1>

      <h2>Montar o diagrama</h2>
      <ActorForm diagramId={diagramId} />
      <UseCaseForm diagramId={diagramId} />
      <RelationshipForm diagramId={diagramId} diagram={diagram} />

      <ElementList
        heading="Atores cadastrados"
        emptyMessage="Nenhum ator cadastrado."
        items={diagram.actors.map((actor) => ({ id: actor.id, label: actor.name }))}
        onDelete={handleDeleteActor}
      />
      <ElementList
        heading="Casos de uso cadastrados"
        emptyMessage="Nenhum caso de uso cadastrado."
        items={diagram.useCases.map((useCase) => ({ id: useCase.id, label: useCase.name }))}
        onDelete={handleDeleteUseCase}
      />
      <ElementList
        heading="Relacionamentos cadastrados"
        emptyMessage="Nenhum relacionamento cadastrado."
        items={diagram.relationships.map((relationship) => ({
          id: relationship.id,
          label: describeRelationship(diagram, relationship),
        }))}
        onDelete={handleDeleteRelationship}
      />

      <h2>Resultado</h2>
      <AccessibleDescriptionPanel diagramId={diagramId} />
      <DiagramSvgViewer diagramId={diagramId} />
    </main>
  );
}
