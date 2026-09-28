export type RelationshipKind = "ASSOCIATION" | "GENERALIZATION" | "INCLUDE" | "EXTEND";
export type AssociationDirection = "TO_USE_CASE" | "TO_ACTOR" | "UNDIRECTED";
export type ElementType = "ACTOR" | "USE_CASE";

export interface DiagramSummary {
  id: string;
  title: string;
  type: "USE_CASE";
  createdAt: string;
  updatedAt: string;
}

export interface ElementDto {
  id: string;
  name: string;
}

export interface RelationshipDto {
  id: string;
  kind: RelationshipKind;
  sourceId: string;
  sourceType: ElementType;
  targetId: string;
  targetType: ElementType;
  direction?: AssociationDirection;
  condition?: string;
}

export interface DiagramDetail {
  id: string;
  title: string;
  actors: ElementDto[];
  useCases: ElementDto[];
  relationships: RelationshipDto[];
}

export interface AccessibleDescription {
  title: string;
  actors: string[];
  useCases: string[];
  relationships: string[];
  plainText: string;
}

export interface ApiErrorItem {
  code?: string;
  message: string;
  path?: string;
}
