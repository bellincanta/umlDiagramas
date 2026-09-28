import { useId, useState, type FormEvent } from "react";
import { useLiveAnnouncer } from "../accessibility/LiveAnnouncerContext";
import { useCreateActorMutation } from "../api/actors";
import { ApiError } from "../api/http";

interface ActorFormProps {
  diagramId: string;
}

export function ActorForm({ diagramId }: ActorFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();
  const { announce } = useLiveAnnouncer();
  const mutation = useCreateActorMutation(diagramId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const actor = await mutation.mutateAsync(name);
      setName("");
      announce(`Ator "${actor.name}" criado.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Não foi possível criar o ator.";
      setError(message);
      announce(`Erro ao criar ator: ${message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
      <h3>Adicionar ator</h3>
      <label htmlFor={inputId}>Nome do ator</label>
      <input
        id={inputId}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <button type="submit" disabled={mutation.isPending}>
        Adicionar ator
      </button>
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
