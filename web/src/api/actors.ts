import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";
import type { ElementDto } from "./types";

function createActorRequest(diagramId: string, name: string): Promise<ElementDto> {
  return apiFetch(`/diagrams/${diagramId}/actors`, { method: "POST", body: JSON.stringify({ name }) });
}

function deleteActorRequest(diagramId: string, actorId: string): Promise<void> {
  return apiFetch(`/diagrams/${diagramId}/actors/${actorId}`, { method: "DELETE" });
}

export function useCreateActorMutation(diagramId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createActorRequest(diagramId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams", diagramId] }),
  });
}

export function useDeleteActorMutation(diagramId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actorId: string) => deleteActorRequest(diagramId, actorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams", diagramId] }),
  });
}
