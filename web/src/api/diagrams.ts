import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./http";
import type { DiagramDetail, DiagramSummary } from "./types";

function listDiagrams(): Promise<DiagramSummary[]> {
  return apiFetch("/diagrams");
}

function createDiagramRequest(title: string): Promise<DiagramSummary> {
  return apiFetch("/diagrams", { method: "POST", body: JSON.stringify({ title }) });
}

function getDiagram(diagramId: string): Promise<DiagramDetail> {
  return apiFetch(`/diagrams/${diagramId}`);
}

function deleteDiagramRequest(diagramId: string): Promise<void> {
  return apiFetch(`/diagrams/${diagramId}`, { method: "DELETE" });
}

export function useDiagramsQuery() {
  return useQuery({ queryKey: ["diagrams"], queryFn: listDiagrams });
}

export function useDiagramQuery(diagramId: string) {
  return useQuery({ queryKey: ["diagrams", diagramId], queryFn: () => getDiagram(diagramId) });
}

export function useCreateDiagramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiagramRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams"] }),
  });
}

export function useDeleteDiagramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiagramRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diagrams"] }),
  });
}
