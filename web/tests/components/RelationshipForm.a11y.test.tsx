import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { LiveAnnouncerProvider } from "../../src/accessibility/LiveAnnouncerContext";
import { RelationshipForm } from "../../src/components/RelationshipForm";
import type { DiagramDetail } from "../../src/api/types";

const mutateAsync = vi.fn();

vi.mock("../../src/api/relationships", () => ({
  useCreateRelationshipMutation: () => ({ mutateAsync, isPending: false }),
}));

const diagram: DiagramDetail = {
  id: "d1",
  title: "Sistema de Pedidos",
  actors: [{ id: "a1", name: "Cliente" }],
  useCases: [
    { id: "u1", name: "Realizar Pedido" },
    { id: "u2", name: "Validar Login" },
  ],
  relationships: [],
};

function renderForm() {
  return render(
    <LiveAnnouncerProvider>
      <RelationshipForm diagramId="d1" diagram={diagram} />
    </LiveAnnouncerProvider>,
  );
}

describe("RelationshipForm", () => {
  it("não tem violações de acessibilidade", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("agrupa os campos em um fieldset com legend", () => {
    renderForm();
    expect(screen.getByRole("group", { name: /adicionar relacionamento/i })).toBeInTheDocument();
  });

  it("só mostra o campo de direção quando o tipo é Associação", async () => {
    renderForm();
    const user = userEvent.setup();

    expect(screen.getByLabelText(/direção da associação/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/tipo de relacionamento/i), "INCLUDE");
    expect(screen.queryByLabelText(/direção da associação/i)).not.toBeInTheDocument();
  });

  it("só mostra o campo de condição quando o tipo é Extensão", async () => {
    renderForm();
    const user = userEvent.setup();

    expect(screen.queryByLabelText(/condição da extensão/i)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/tipo de relacionamento/i), "EXTEND");
    expect(screen.getByLabelText(/condição da extensão/i)).toBeInTheDocument();
  });

  it("envia o relacionamento com origem, destino e direção selecionados", async () => {
    mutateAsync.mockResolvedValueOnce({ id: "r1" });
    renderForm();
    const user = userEvent.setup();

    const sourceSelect = screen.getByLabelText(/elemento de origem/i);
    const targetSelect = screen.getByLabelText(/elemento de destino/i);
    await user.selectOptions(sourceSelect, within(sourceSelect).getByText(/cliente \(ator\)/i));
    await user.selectOptions(targetSelect, within(targetSelect).getByText(/realizar pedido \(caso de uso\)/i));
    await user.click(screen.getByRole("button", { name: /adicionar relacionamento/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      type: "ASSOCIATION",
      sourceId: "a1",
      targetId: "u1",
      direction: "UNDIRECTED",
      condition: undefined,
    });
  });
});
