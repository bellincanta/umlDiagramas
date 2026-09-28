import { AssociationDirection, type AssociationRelationship } from "../../domain/relationship/association-relationship.js";
import type { ExtendRelationship } from "../../domain/relationship/extend-relationship.js";
import type { GeneralizationRelationship } from "../../domain/relationship/generalization-relationship.js";
import type { IncludeRelationship } from "../../domain/relationship/include-relationship.js";
import type { RelationshipVisitor } from "../../domain/relationship/relationship-visitor.js";
import { Actor } from "../../domain/usecase/actor.js";
import type { UseCaseDiagram } from "../../domain/usecase/use-case-diagram.js";
import type { AccessibleDescriptionDto } from "../dto/accessible-description.dto.js";

/**
 * Gera uma descrição textual em português, navegável por leitor de tela:
 * leitura sequencial e não-espacial (título -> atores -> casos de uso ->
 * relacionamentos), uma frase completa por relacionamento, sem símbolos
 * visuais como "->".
 */
export class AccessibleTextRenderer implements RelationshipVisitor<string> {
  render(diagram: UseCaseDiagram): AccessibleDescriptionDto {
    const actors = diagram.actors.map((actor) => actor.name);
    const useCases = diagram.useCases.map((useCase) => useCase.name);
    const relationships = diagram.relationships.map((relationship) => relationship.accept(this));

    return {
      title: diagram.title,
      actors,
      useCases,
      relationships,
      plainText: this.toPlainText(diagram.title, actors, useCases, relationships),
    };
  }

  visitAssociation(relationship: AssociationRelationship): string {
    const actor = relationship.source instanceof Actor ? relationship.source : relationship.target;
    const useCase = relationship.source instanceof Actor ? relationship.target : relationship.source;

    switch (relationship.direction) {
      case AssociationDirection.TO_USE_CASE:
        return `Associação: o ator "${actor.name}" fornece dados para o caso de uso "${useCase.name}".`;
      case AssociationDirection.TO_ACTOR:
        return `Associação: o caso de uso "${useCase.name}" fornece informações ao ator "${actor.name}".`;
      default:
        return `Associação: o ator "${actor.name}" está associado ao caso de uso "${useCase.name}".`;
    }
  }

  visitGeneralization(relationship: GeneralizationRelationship): string {
    const tipo = relationship.source instanceof Actor ? "o ator" : "o caso de uso";
    return `Generalização: ${tipo} "${relationship.source.name}" é uma especialização de "${relationship.target.name}".`;
  }

  visitInclude(relationship: IncludeRelationship): string {
    return `Inclusão: o caso de uso "${relationship.source.name}" inclui obrigatoriamente o caso de uso "${relationship.target.name}".`;
  }

  visitExtend(relationship: ExtendRelationship): string {
    const base = `Extensão: o caso de uso "${relationship.source.name}" estende opcionalmente o caso de uso "${relationship.target.name}"`;
    return relationship.condition
      ? `${base}, caso a condição "${relationship.condition}" seja satisfeita.`
      : `${base}.`;
  }

  private toPlainText(title: string, actors: string[], useCases: string[], relationships: string[]): string {
    const lines: string[] = [`Diagrama de Casos de Uso: "${title}"`, ""];

    lines.push(`Atores (${actors.length}):`);
    lines.push(...(actors.length > 0 ? actors.map((name, i) => `${i + 1}. ${name}`) : ["Nenhum ator cadastrado."]));
    lines.push("");

    lines.push(`Casos de Uso (${useCases.length}):`);
    lines.push(
      ...(useCases.length > 0 ? useCases.map((name, i) => `${i + 1}. ${name}`) : ["Nenhum caso de uso cadastrado."]),
    );
    lines.push("");

    lines.push(`Relacionamentos (${relationships.length}):`);
    lines.push(
      ...(relationships.length > 0
        ? relationships.map((sentence, i) => `${i + 1}. ${sentence}`)
        : ["Nenhum relacionamento cadastrado."]),
    );
    lines.push("");

    lines.push("Fim da descrição do diagrama.");

    return lines.join("\n");
  }
}
