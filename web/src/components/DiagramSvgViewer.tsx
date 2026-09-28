import { useDiagramSvgQuery } from "../api/render";

interface DiagramSvgViewerProps {
  diagramId: string;
}

/**
 * Visualização visual do diagrama (complemento para professor/colegas que
 * enxergam). O SVG gerado pelo back-end segue a notação UML: boneco-palito
 * para atores, elipses para casos de uso e limite do sistema como retângulo.
 *
 * Fica `aria-hidden` porque a fonte canônica e acessível é o
 * AccessibleDescriptionPanel ao lado.
 */
export function DiagramSvgViewer({ diagramId }: DiagramSvgViewerProps) {
  const { data, isLoading, isError } = useDiagramSvgQuery(diagramId);

  if (isLoading) {
    return <p>Carregando diagrama visual...</p>;
  }

  if (isError || !data) {
    return <p role="alert">Não foi possível carregar o diagrama visual.</p>;
  }

  return (
    <section aria-label="Representação visual do diagrama">
      <h2>Diagrama visual</h2>
      {/* eslint-disable-next-line react/no-danger */}
      <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: data }} />
      <p className="visually-hidden">
        Esta é uma representação visual complementar. A descrição textual é a referência completa e acessível do
        diagrama.
      </p>
    </section>
  );
}
