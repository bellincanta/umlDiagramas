import { useId, useState, type FormEvent } from "react";
import { useLiveAnnouncer } from "../accessibility/LiveAnnouncerContext";
import { ApiError } from "../api/http";
import { useCreateRelationshipMutation } from "../api/relationships";
import type { AssociationDirection, DiagramDetail, RelationshipKind } from "../api/types";

interface RelationshipFormProps {
  diagramId: string;
  diagram: DiagramDetail;
}

const RELATIONSHIP_LABELS: Record<RelationshipKind, string> = {
  ASSOCIATION: "Associação (entre um ator e um caso de uso)",
  GENERALIZATION: "Generalização (entre dois atores ou dois casos de uso)",
  INCLUDE: "Inclusão <<include>> (entre dois casos de uso)",
  EXTEND: "Extensão <<extend>> (entre dois casos de uso)",
};

const DIRECTION_LABELS: Record<AssociationDirection, string> = {
  TO_USE_CASE: "Ator fornece dados ao caso de uso",
  TO_ACTOR: "Caso de uso fornece informações ao ator",
  UNDIRECTED: "Sem direção definida",
};

export function RelationshipForm({ diagramId, diagram }: RelationshipFormProps) {
  const [type, setType] = useState<RelationshipKind>("ASSOCIATION");
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [direction, setDirection] = useState<AssociationDirection>("UNDIRECTED");
  const [condition, setCondition] = useState("");
  const [error, setError] = useState<string | null>(null);

  const typeId = useId();
  const sourceId_ = useId();
  const targetId_ = useId();
  const directionId = useId();
  const conditionId = useId();
  const errorId = useId();

  const { announce } = useLiveAnnouncer();
  const mutation = useCreateRelationshipMutation(diagramId);

  const elements = [
    ...diagram.actors.map((actor) => ({ id: actor.id, label: `${actor.name} (Ator)` })),
    ...diagram.useCases.map((useCase) => ({ id: useCase.id, label: `${useCase.name} (Caso de uso)` })),
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await mutation.mutateAsync({
        type,
        sourceId,
        targetId,
        direction: type === "ASSOCIATION" ? direction : undefined,
        condition: type === "EXTEND" && condition.trim() ? condition.trim() : undefined,
      });
      announce(`Relacionamento de ${RELATIONSHIP_LABELS[type]} criado.`);
      setSourceId("");
      setTargetId("");
      setCondition("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Não foi possível criar o relacionamento.";
      setError(message);
      announce(`Erro ao criar relacionamento: ${message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
      <fieldset>
        <legend>Adicionar relacionamento</legend>

        <label htmlFor={typeId}>Tipo de relacionamento</label>
        <select id={typeId} value={type} onChange={(event) => setType(event.target.value as RelationshipKind)}>
          {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label htmlFor={sourceId_}>Elemento de origem</label>
        <select id={sourceId_} value={sourceId} onChange={(event) => setSourceId(event.target.value)} required>
          <option value="">Selecione um elemento...</option>
          {elements.map((element) => (
            <option key={element.id} value={element.id}>
              {element.label}
            </option>
          ))}
        </select>

        <label htmlFor={targetId_}>Elemento de destino</label>
        <select id={targetId_} value={targetId} onChange={(event) => setTargetId(event.target.value)} required>
          <option value="">Selecione um elemento...</option>
          {elements.map((element) => (
            <option key={element.id} value={element.id}>
              {element.label}
            </option>
          ))}
        </select>

        {type === "ASSOCIATION" && (
          <>
            <label htmlFor={directionId}>Direção da associação</label>
            <select
              id={directionId}
              value={direction}
              onChange={(event) => setDirection(event.target.value as AssociationDirection)}
            >
              {Object.entries(DIRECTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </>
        )}

        {type === "EXTEND" && (
          <>
            <label htmlFor={conditionId}>Condição da extensão (opcional)</label>
            <input
              id={conditionId}
              type="text"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            />
          </>
        )}

        <button type="submit" disabled={mutation.isPending}>
          Adicionar relacionamento
        </button>

        {error && (
          <p id={errorId} role="alert">
            {error}
          </p>
        )}
      </fieldset>
    </form>
  );
}
