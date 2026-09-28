import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";
import type { AssociationDirection, RelationshipDto, RelationshipKind } from "./types";

export interface CreateRelationshipPayload {
  type: RelationshipKind;
  sourceId: string;
  targetId: string;
  direction?: AssociationDirection;
  condition?: string;
}

function createRelationshipRequest(diagramId: string, payload: CreateRelationshipPayload): Promise<RelationshipDto> {
  return apiFetch(`/diagrams/${diagramId}/relationships`, { method: "POST", body: JSON.stringify(payload) });
}

function deleteRelationshipRequest(diagramId: string, relationshipId: string): Promise<void> {
  return apiFetch(`/diagrams/${diagramId}/relationships/${relationshipId}`, { method: "DELETE" });
}

export function useCreateRelationshipMutation(diagramId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRelationshipPayload) => createRelationshipRequest(diagramId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams", diagramId] }),
  });
}

export function useDeleteRelationshipMutation(diagramId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relationshipId: string) => deleteRelationshipRequest(diagramId, relationshipId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams", diagramId] }),
  });
}
