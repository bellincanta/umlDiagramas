import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { ElementList } from "../../src/components/ElementList";

describe("ElementList", () => {
  it("não tem violações de acessibilidade com itens", async () => {
    const { container } = render(
      <ElementList
        heading="Atores"
        emptyMessage="Nenhum ator cadastrado."
        items={[
          { id: "a1", label: "Cliente" },
          { id: "a2", label: "Administrador" },
        ]}
        onDelete={() => {}}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("mostra a mensagem de lista vazia quando não há itens", () => {
    render(<ElementList heading="Atores" emptyMessage="Nenhum ator cadastrado." items={[]} onDelete={() => {}} />);
    expect(screen.getByText("Nenhum ator cadastrado.")).toBeInTheDocument();
  });

  it("cada botão de remover identifica o item correspondente para o leitor de tela", () => {
    render(
      <ElementList
        heading="Atores"
        emptyMessage="Nenhum ator cadastrado."
        items={[
          { id: "a1", label: "Cliente" },
          { id: "a2", label: "Administrador" },
        ]}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /remover.*cliente/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remover.*administrador/i })).toBeInTheDocument();
  });

  it("aciona onDelete com o id do item ao clicar em remover", async () => {
    const onDelete = vi.fn();
    render(
      <ElementList
        heading="Atores"
        emptyMessage="Nenhum ator cadastrado."
        items={[{ id: "a1", label: "Cliente" }]}
        onDelete={onDelete}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /remover.*cliente/i }));

    expect(onDelete).toHaveBeenCalledWith("a1");
  });
});
