import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./http";
import type { AccessibleDescription } from "./types";

function fetchDiagramSvg(diagramId: string): Promise<string> {
  return apiFetch(`/diagrams/${diagramId}/render/svg`);
}

function fetchAccessibleText(diagramId: string): Promise<AccessibleDescription> {
  return apiFetch(`/diagrams/${diagramId}/render/text`);
}

export function useDiagramSvgQuery(diagramId: string) {
  return useQuery({
    queryKey: ["diagrams", diagramId, "render", "svg"],
    queryFn: () => fetchDiagramSvg(diagramId),
  });
}

export function useAccessibleTextQuery(diagramId: string) {
  return useQuery({
    queryKey: ["diagrams", diagramId, "render", "text"],
    queryFn: () => fetchAccessibleText(diagramId),
  });
}
