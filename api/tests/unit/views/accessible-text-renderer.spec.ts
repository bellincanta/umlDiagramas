import { describe, expect, it } from "vitest";
import { AssociationDirection, AssociationRelationship } from "../../../src/domain/relationship/association-relationship.js";
import { ExtendRelationship } from "../../../src/domain/relationship/extend-relationship.js";
import { GeneralizationRelationship } from "../../../src/domain/relationship/generalization-relationship.js";
import { IncludeRelationship } from "../../../src/domain/relationship/include-relationship.js";
import { RelationshipRuleEngine } from "../../../src/domain/relationship/relationship-rule-engine.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";
import { UseCaseDiagram } from "../../../src/domain/usecase/use-case-diagram.js";
import { AccessibleTextRenderer } from "../../../src/views/renderers/accessible-text-renderer.js";

const DIAGRAM_ID = "diagram-1";

describe("AccessibleTextRenderer", () => {
  it("descreve um diagrama vazio", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema Vazio");
    const renderer = new AccessibleTextRenderer();

    const result = renderer.render(diagram);

    expect(result.actors).toEqual([]);
    expect(result.useCases).toEqual([]);
    expect(result.relationships).toEqual([]);
    expect(result.plainText).toContain("Nenhum ator cadastrado.");
    expect(result.plainText).toContain("Nenhum caso de uso cadastrado.");
    expect(result.plainText).toContain("Nenhum relacionamento cadastrado.");
  });

  it("gera uma frase por tipo de relacionamento, em ordem fixa", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema de Pedidos");
    const engine = new RelationshipRuleEngine();

    const cliente = new Actor("a1", "Cliente", DIAGRAM_ID);
    const admin = new Actor("a2", "Administrador", DIAGRAM_ID);
    diagram.addActor(cliente);
    diagram.addActor(admin);

    const realizarPedido = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const validarLogin = new UseCase("u2", "Validar Login", DIAGRAM_ID);
    const pagarComCartao = new UseCase("u3", "Pagar com Cartão", DIAGRAM_ID);
    diagram.addUseCase(realizarPedido);
    diagram.addUseCase(validarLogin);
    diagram.addUseCase(pagarComCartao);

    diagram.addRelationship(
      new AssociationRelationship("r1", DIAGRAM_ID, cliente, realizarPedido, AssociationDirection.TO_USE_CASE),
      engine,
    );
    diagram.addRelationship(new IncludeRelationship("r2", DIAGRAM_ID, realizarPedido, validarLogin), engine);
    diagram.addRelationship(
      new ExtendRelationship("r3", DIAGRAM_ID, pagarComCartao, realizarPedido, "forma de pagamento seja cartão"),
      engine,
    );
    diagram.addRelationship(new GeneralizationRelationship("r4", DIAGRAM_ID, admin, cliente), engine);

    const renderer = new AccessibleTextRenderer();
    const result = renderer.render(diagram);

    expect(result.actors).toEqual(["Cliente", "Administrador"]);
    expect(result.useCases).toEqual(["Realizar Pedido", "Validar Login", "Pagar com Cartão"]);
    expect(result.relationships).toEqual([
      'Associação: o ator "Cliente" fornece dados para o caso de uso "Realizar Pedido".',
      'Inclusão: o caso de uso "Realizar Pedido" inclui obrigatoriamente o caso de uso "Validar Login".',
      'Extensão: o caso de uso "Pagar com Cartão" estende opcionalmente o caso de uso "Realizar Pedido", caso a condição "forma de pagamento seja cartão" seja satisfeita.',
      'Generalização: o ator "Administrador" é uma especialização de "Cliente".',
    ]);
    expect(result.plainText.indexOf("Atores (2):")).toBeLessThan(result.plainText.indexOf("Casos de Uso (3):"));
    expect(result.plainText.indexOf("Casos de Uso (3):")).toBeLessThan(result.plainText.indexOf("Relacionamentos (4):"));
  });

  it("descreve associação não-direcionada e extensão sem condição", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema");
    const engine = new RelationshipRuleEngine();
    const cliente = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase1 = new UseCase("u1", "Realizar Pedido", DIAGRAM_ID);
    const useCase2 = new UseCase("u2", "Cancelar Pedido", DIAGRAM_ID);
    diagram.addActor(cliente);
    diagram.addUseCase(useCase1);
    diagram.addUseCase(useCase2);

    diagram.addRelationship(new AssociationRelationship("r1", DIAGRAM_ID, cliente, useCase1), engine);
    diagram.addRelationship(new ExtendRelationship("r2", DIAGRAM_ID, useCase2, useCase1), engine);

    const renderer = new AccessibleTextRenderer();
    const result = renderer.render(diagram);

    expect(result.relationships[0]).toBe('Associação: o ator "Cliente" está associado ao caso de uso "Realizar Pedido".');
    expect(result.relationships[1]).toBe(
      'Extensão: o caso de uso "Cancelar Pedido" estende opcionalmente o caso de uso "Realizar Pedido".',
    );
  });

  it("descreve associação com direção do caso de uso para o ator", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema");
    const engine = new RelationshipRuleEngine();
    const cliente = new Actor("a1", "Cliente", DIAGRAM_ID);
    const useCase = new UseCase("u1", "Consultar Saldo", DIAGRAM_ID);
    diagram.addActor(cliente);
    diagram.addUseCase(useCase);

    diagram.addRelationship(
      new AssociationRelationship("r1", DIAGRAM_ID, cliente, useCase, AssociationDirection.TO_ACTOR),
      engine,
    );

    const renderer = new AccessibleTextRenderer();
    const result = renderer.render(diagram);

    expect(result.relationships[0]).toBe(
      'Associação: o caso de uso "Consultar Saldo" fornece informações ao ator "Cliente".',
    );
  });

  it("descreve generalização entre casos de uso", () => {
    const diagram = new UseCaseDiagram(DIAGRAM_ID, "Sistema");
    const engine = new RelationshipRuleEngine();
    const especifico = new UseCase("u1", "Pagar com Cartão", DIAGRAM_ID);
    const geral = new UseCase("u2", "Pagar", DIAGRAM_ID);
    diagram.addUseCase(especifico);
    diagram.addUseCase(geral);

    diagram.addRelationship(new GeneralizationRelationship("r1", DIAGRAM_ID, especifico, geral), engine);

    const renderer = new AccessibleTextRenderer();
    const result = renderer.render(diagram);

    expect(result.relationships[0]).toBe(
      'Generalização: o caso de uso "Pagar com Cartão" é uma especialização de "Pagar".',
    );
  });
});
