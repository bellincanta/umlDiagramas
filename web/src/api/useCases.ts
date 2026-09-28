import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";
import type { ElementDto } from "./types";

function createUseCaseRequest(diagramId: string, name: string): Promise<ElementDto> {
  return apiFetch(`/diagrams/${diagramId}/use-cases`, { method: "POST", body: JSON.stringify({ name }) });
}

function deleteUseCaseRequest(diagramId: string, useCaseId: string): Promise<void> {
  return apiFetch(`/diagrams/${diagramId}/use-cases/${useCaseId}`, { method: "DELETE" });
}

export function useCreateUseCaseMutation(diagramId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createUseCaseRequest(diagramId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams", diagramId] }),
  });
}

export function useDeleteUseCaseMutation(diagramId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (useCaseId: string) => deleteUseCaseRequest(diagramId, useCaseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams", diagramId] }),
  });
}
