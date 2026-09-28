export interface RelationshipJsonDto {
  id: string;
  kind: string;
  sourceId: string;
  sourceType: "ACTOR" | "USE_CASE";
  targetId: string;
  targetType: "ACTOR" | "USE_CASE";
  direction?: string;
  condition?: string;
}

export interface DiagramJsonDto {
  id: string;
  title: string;
  actors: { id: string; name: string }[];
  useCases: { id: string; name: string }[];
  relationships: RelationshipJsonDto[];
}
