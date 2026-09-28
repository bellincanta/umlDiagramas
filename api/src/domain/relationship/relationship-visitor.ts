import type { AssociationRelationship } from "./association-relationship.js";
import type { ExtendRelationship } from "./extend-relationship.js";
import type { GeneralizationRelationship } from "./generalization-relationship.js";
import type { IncludeRelationship } from "./include-relationship.js";

export interface RelationshipVisitor<T> {
  visitAssociation(relationship: AssociationRelationship): T;
  visitGeneralization(relationship: GeneralizationRelationship): T;
  visitInclude(relationship: IncludeRelationship): T;
  visitExtend(relationship: ExtendRelationship): T;
}
