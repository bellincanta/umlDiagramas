import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCreateDiagramMutation, useDiagramsQuery } from "../api/diagrams";

export function DiagramListPage() {
  const { data, isLoading, isError } = useDiagramsQuery();
  const createDiagram = useCreateDiagramMutation();
  const [title, setTitle] = useState("");
  const inputId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    await createDiagram.mutateAsync(title.trim());
    setTitle("");
  }

  return (
    <main id="main-content">
      <h1>Diagramas de Caso de Uso</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId}>Título do novo diagrama</label>
        <input id={inputId} type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <button type="submit" disabled={createDiagram.isPending}>
          Criar diagrama
        </button>
      </form>

      <h2>Diagramas existentes</h2>
      {isLoading && <p>Carregando diagramas...</p>}
      {isError && <p role="alert">Não foi possível carregar os diagramas.</p>}
      {data && data.length === 0 && <p>Nenhum diagrama criado ainda.</p>}
      {data && data.length > 0 && (
        <ul className="element-list">
          {data.map((diagram) => (
            <li key={diagram.id}>
              <Link to={`/diagrams/${diagram.id}`}>{diagram.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
