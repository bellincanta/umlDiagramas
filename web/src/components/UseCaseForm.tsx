import { useId, useState, type FormEvent } from "react";
import { useLiveAnnouncer } from "../accessibility/LiveAnnouncerContext";
import { ApiError } from "../api/http";
import { useCreateUseCaseMutation } from "../api/useCases";

interface UseCaseFormProps {
  diagramId: string;
}

export function UseCaseForm({ diagramId }: UseCaseFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();
  const { announce } = useLiveAnnouncer();
  const mutation = useCreateUseCaseMutation(diagramId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const useCase = await mutation.mutateAsync(name);
      setName("");
      announce(`Caso de uso "${useCase.name}" criado.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Não foi possível criar o caso de uso.";
      setError(message);
      announce(`Erro ao criar caso de uso: ${message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
      <h3>Adicionar caso de uso</h3>
      <label htmlFor={inputId}>Nome do caso de uso</label>
      <input
        id={inputId}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <button type="submit" disabled={mutation.isPending}>
        Adicionar caso de uso
      </button>
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
