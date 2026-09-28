import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { DiagramSvgViewer } from "../../src/components/DiagramSvgViewer";

const useDiagramSvgQuery = vi.fn();

vi.mock("../../src/api/render", () => ({
  useDiagramSvgQuery: (diagramId: string) => useDiagramSvgQuery(diagramId),
  useAccessibleTextQuery: vi.fn(),
}));

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
  <circle cx="80" cy="60" r="11" fill="white" stroke="#222" stroke-width="1.4"/>
  <ellipse cx="240" cy="100" rx="72" ry="34" fill="white" stroke="#222" stroke-width="1.4"/>
  <text x="240" y="100" text-anchor="middle">Realizar Pedido</text>
</svg>`;

describe("DiagramSvgViewer", () => {
  it("não tem violações de acessibilidade", async () => {
    useDiagramSvgQuery.mockReturnValue({ isLoading: false, isError: false, data: SAMPLE_SVG });

    const { container } = render(<DiagramSvgViewer diagramId="d1" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marca o SVG como aria-hidden, pois a descrição textual é a referência canônica", () => {
    useDiagramSvgQuery.mockReturnValue({ isLoading: false, isError: false, data: SAMPLE_SVG });

    const { container } = render(<DiagramSvgViewer diagramId="d1" />);
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("exibe alerta acessível quando a busca falha", () => {
    useDiagramSvgQuery.mockReturnValue({ isLoading: false, isError: true, data: undefined });

    render(<DiagramSvgViewer diagramId="d1" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/não foi possível carregar/i);
  });
});
