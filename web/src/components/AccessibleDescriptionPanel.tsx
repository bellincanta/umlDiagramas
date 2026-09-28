import { useAccessibleTextQuery } from "../api/render";

interface AccessibleDescriptionPanelProps {
  diagramId: string;
}

/**
 * Interface canônica do aluno cego: descrição textual sequencial e
 * navegável por landmarks/headings de leitor de tela. Substitui a
 * necessidade de "ver" o diagrama para entender o que foi montado.
 */
export function AccessibleDescriptionPanel({ diagramId }: AccessibleDescriptionPanelProps) {
  const { data, isLoading, isError } = useAccessibleTextQuery(diagramId);

  if (isLoading) {
    return <p>Carregando descrição do diagrama...</p>;
  }

  if (isError || !data) {
    return <p role="alert">Não foi possível carregar a descrição do diagrama.</p>;
  }

  return (
    <section aria-label="Descrição acessível do diagrama">
      <h2>Diagrama de Casos de Uso: {data.title}</h2>

      <h3>Atores ({data.actors.length})</h3>
      {data.actors.length === 0 ? (
        <p>Nenhum ator cadastrado.</p>
      ) : (
        <ol>
          {/* Nomes podem se repetir (o domínio não exige nomes únicos), por
              isso a key combina posição e texto em vez de usar o nome sozinho. */}
          {data.actors.map((actor, index) => (
            <li key={`${index}-${actor}`}>{actor}</li>
          ))}
        </ol>
      )}

      <h3>Casos de Uso ({data.useCases.length})</h3>
      {data.useCases.length === 0 ? (
        <p>Nenhum caso de uso cadastrado.</p>
      ) : (
        <ol>
          {data.useCases.map((useCase, index) => (
            <li key={`${index}-${useCase}`}>{useCase}</li>
          ))}
        </ol>
      )}

      <h3>Relacionamentos ({data.relationships.length})</h3>
      {data.relationships.length === 0 ? (
        <p>Nenhum relacionamento cadastrado.</p>
      ) : (
        <ol>
          {data.relationships.map((sentence, index) => (
            <li key={`${index}-${sentence}`}>{sentence}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
