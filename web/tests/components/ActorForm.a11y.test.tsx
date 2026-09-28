import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { LiveAnnouncerProvider } from "../../src/accessibility/LiveAnnouncerContext";
import { ActorForm } from "../../src/components/ActorForm";

const mutateAsync = vi.fn();

vi.mock("../../src/api/actors", () => ({
  useCreateActorMutation: () => ({ mutateAsync, isPending: false }),
}));

function renderForm() {
  return render(
    <LiveAnnouncerProvider>
      <ActorForm diagramId="d1" />
    </LiveAnnouncerProvider>,
  );
}

describe("ActorForm", () => {
  it("não tem violações de acessibilidade", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("tem um label associado ao campo de nome", () => {
    renderForm();
    expect(screen.getByLabelText(/nome do ator/i)).toBeInTheDocument();
  });

  it("envia o nome do ator e limpa o campo após sucesso", async () => {
    mutateAsync.mockResolvedValueOnce({ id: "a1", name: "Cliente" });
    renderForm();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nome do ator/i), "Cliente");
    await user.click(screen.getByRole("button", { name: /adicionar ator/i }));

    expect(mutateAsync).toHaveBeenCalledWith("Cliente");
    expect(screen.getByLabelText(/nome do ator/i)).toHaveValue("");
  });

  it("exibe uma mensagem de erro acessível quando a criação falha", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("Falha ao criar"));
    renderForm();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nome do ator/i), "Cliente");
    await user.click(screen.getByRole("button", { name: /adicionar ator/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível criar o ator/i);
  });
});
