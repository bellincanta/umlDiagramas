import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { AccessibleDescriptionPanel } from "../../src/components/AccessibleDescriptionPanel";

const useAccessibleTextQuery = vi.fn();

vi.mock("../../src/api/render", () => ({
  useAccessibleTextQuery: (diagramId: string) => useAccessibleTextQuery(diagramId),
}));

describe("AccessibleDescriptionPanel", () => {
  it("não tem violações de acessibilidade", async () => {
    useAccessibleTextQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        title: "Sistema de Pedidos",
        actors: ["Cliente"],
        useCases: ["Realizar Pedido", "Validar Login"],
        relationships: ['Associação: o ator "Cliente" está associado ao caso de uso "Realizar Pedido".'],
        plainText: "...",
      },
    });

    const { container } = render(<AccessibleDescriptionPanel diagramId="d1" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("organiza o conteúdo em headings e listas ordenadas, na ordem título -> atores -> casos de uso -> relacionamentos", () => {
    useAccessibleTextQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        title: "Sistema de Pedidos",
        actors: ["Cliente"],
        useCases: ["Realizar Pedido"],
        relationships: ["Associação: ..."],
        plainText: "...",
      },
    });

    render(<AccessibleDescriptionPanel diagramId="d1" />);

    const headings = screen.getAllByRole("heading").map((heading) => heading.textContent);
    expect(headings[0]).toMatch(/sistema de pedidos/i);
    expect(headings[1]).toMatch(/atores/i);
    expect(headings[2]).toMatch(/casos de uso/i);
    expect(headings[3]).toMatch(/relacionamentos/i);

    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(3);
  });

  it("mostra mensagens de lista vazia quando o diagrama não tem elementos", () => {
    useAccessibleTextQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { title: "Vazio", actors: [], useCases: [], relationships: [], plainText: "..." },
    });

    render(<AccessibleDescriptionPanel diagramId="d1" />);

    expect(screen.getByText("Nenhum ator cadastrado.")).toBeInTheDocument();
    expect(screen.getByText("Nenhum caso de uso cadastrado.")).toBeInTheDocument();
    expect(screen.getByText("Nenhum relacionamento cadastrado.")).toBeInTheDocument();
  });

  it("mostra um erro acessível quando a busca falha", () => {
    useAccessibleTextQuery.mockReturnValue({ isLoading: false, isError: true, data: undefined });

    render(<AccessibleDescriptionPanel diagramId="d1" />);

    expect(screen.getByRole("alert")).toHaveTextContent(/não foi possível carregar/i);
  });
});
