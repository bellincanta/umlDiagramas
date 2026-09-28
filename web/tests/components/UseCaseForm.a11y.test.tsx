import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { LiveAnnouncerProvider } from "../../src/accessibility/LiveAnnouncerContext";
import { UseCaseForm } from "../../src/components/UseCaseForm";

const mutateAsync = vi.fn();

vi.mock("../../src/api/useCases", () => ({
  useCreateUseCaseMutation: () => ({ mutateAsync, isPending: false }),
}));

function renderForm() {
  return render(
    <LiveAnnouncerProvider>
      <UseCaseForm diagramId="d1" />
    </LiveAnnouncerProvider>,
  );
}

describe("UseCaseForm", () => {
  it("não tem violações de acessibilidade", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("envia o nome do caso de uso e limpa o campo após sucesso", async () => {
    mutateAsync.mockResolvedValueOnce({ id: "u1", name: "Realizar Pedido" });
    renderForm();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nome do caso de uso/i), "Realizar Pedido");
    await user.click(screen.getByRole("button", { name: /adicionar caso de uso/i }));

    expect(mutateAsync).toHaveBeenCalledWith("Realizar Pedido");
    expect(screen.getByLabelText(/nome do caso de uso/i)).toHaveValue("");
  });
});
