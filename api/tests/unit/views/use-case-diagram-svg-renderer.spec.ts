import { describe, expect, it } from "vitest";
import { AssociationDirection, AssociationRelationship } from "../../../src/domain/relationship/association-relationship.js";
import { ExtendRelationship } from "../../../src/domain/relationship/extend-relationship.js";
import { GeneralizationRelationship } from "../../../src/domain/relationship/generalization-relationship.js";
import { IncludeRelationship } from "../../../src/domain/relationship/include-relationship.js";
import { RelationshipRuleEngine } from "../../../src/domain/relationship/relationship-rule-engine.js";
import { Actor } from "../../../src/domain/usecase/actor.js";
import { UseCase } from "../../../src/domain/usecase/use-case.js";
import { UseCaseDiagram } from "../../../src/domain/usecase/use-case-diagram.js";
import { UseCaseDiagramSvgRenderer } from "../../../src/views/renderers/use-case-diagram-svg-renderer.js";

const DID = "d1";

function buildFullDiagram() {
  const diagram = new UseCaseDiagram(DID, "Sistema de Pedidos");
  const engine = new RelationshipRuleEngine();

  const cliente = new Actor("a1", "Cliente", DID);
  const admin = new Actor("a2", "Administrador", DID);
  diagram.addActor(cliente);
  diagram.addActor(admin);

  const realizarPedido = new UseCase("u1", "Realizar Pedido", DID);
  const validarLogin = new UseCase("u2", "Validar Login", DID);
  const pagarComCartao = new UseCase("u3", "Pagar com Cartão", DID);
  diagram.addUseCase(realizarPedido);
  diagram.addUseCase(validarLogin);
  diagram.addUseCase(pagarComCartao);

  diagram.addRelationship(
    new AssociationRelationship("r1", DID, cliente, realizarPedido, AssociationDirection.TO_USE_CASE),
    engine,
  );
  diagram.addRelationship(new GeneralizationRelationship("r2", DID, admin, cliente), engine);
  diagram.addRelationship(new IncludeRelationship("r3", DID, realizarPedido, validarLogin), engine);
  diagram.addRelationship(
    new ExtendRelationship("r4", DID, pagarComCartao, realizarPedido, "pagamento com cartão"),
    engine,
  );

  return diagram;
}

describe("UseCaseDiagramSvgRenderer", () => {
  it("produz SVG válido com boneco-palito para o ator e elipse para o caso de uso", () => {
    const svg = new UseCaseDiagramSvgRenderer().render(buildFullDiagram());

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("<circle"); // cabeça do boneco
    expect(svg).toContain("<ellipse"); // caso de uso
    expect(svg).toContain("Cliente");
    expect(svg).toContain("Realizar Pedido");
  });

  it("inclui o retângulo do limite do sistema com o título do diagrama", () => {
    const svg = new UseCaseDiagramSvgRenderer().render(buildFullDiagram());

    expect(svg).toContain("<rect");
    expect(svg).toContain("Sistema de Pedidos");
  });

  it("desenha seta tracejada com rótulo para inclusão e extensão", () => {
    const svg = new UseCaseDiagramSvgRenderer().render(buildFullDiagram());

    expect(svg).toContain("stroke-dasharray");
    expect(svg).toContain("&lt;&lt;include&gt;&gt;");
    expect(svg).toContain("&lt;&lt;extend&gt;&gt;");
  });

  it("usa o marcador de triângulo vazio para generalização", () => {
    const svg = new UseCaseDiagramSvgRenderer().render(buildFullDiagram());

    expect(svg).toContain("hollow-triangle");
    expect(svg).toContain("fill=\"white\"");
  });

  it("retorna SVG vazio quando o diagrama não tem elementos", () => {
    const empty = new UseCaseDiagram(DID, "Vazio");
    const svg = new UseCaseDiagramSvgRenderer().render(empty);

    expect(svg).toContain("<svg");
    expect(svg).toContain("diagrama vazio");
  });

  it("escapa caracteres XML nos nomes dos elementos", () => {
    const diagram = new UseCaseDiagram(DID, "Sistema");
    diagram.addActor(new Actor("a1", "Cliente & <VIP>", DID));
    const svg = new UseCaseDiagramSvgRenderer().render(diagram);

    expect(svg).toContain("Cliente &amp; &lt;VIP&gt;");
    expect(svg).not.toContain("<VIP>");
  });
});
