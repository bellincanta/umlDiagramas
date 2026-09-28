import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, resetDatabase } from "../helpers/test-app.js";

beforeEach(async () => {
  await resetDatabase();
});

describe("Diagram API — fluxo completo", () => {
  it("cria um diagrama, popula com atores/casos de uso/relacionamentos e renderiza nos três formatos", async () => {
    const createDiagram = await request(app)
      .post("/api/v1/diagrams")
      .send({ title: "Sistema de Pedidos" })
      .expect(201);
    const diagramId = createDiagram.body.id as string;
    expect(diagramId).toBeTruthy();

    const cliente = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/actors`)
      .send({ name: "Cliente" })
      .expect(201);

    const realizarPedido = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/use-cases`)
      .send({ name: "Realizar Pedido" })
      .expect(201);

    const validarLogin = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/use-cases`)
      .send({ name: "Validar Login" })
      .expect(201);

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({
        type: "ASSOCIATION",
        sourceId: cliente.body.id,
        targetId: realizarPedido.body.id,
        direction: "TO_USE_CASE",
      })
      .expect(201);

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "INCLUDE", sourceId: realizarPedido.body.id, targetId: validarLogin.body.id })
      .expect(201);

    const detail = await request(app).get(`/api/v1/diagrams/${diagramId}`).expect(200);
    expect(detail.body.actors).toHaveLength(1);
    expect(detail.body.useCases).toHaveLength(2);
    expect(detail.body.relationships).toHaveLength(2);

    const svg = await request(app).get(`/api/v1/diagrams/${diagramId}/render/svg`).expect(200);
    expect(svg.text).toContain("<svg");
    expect(svg.text).toContain("<ellipse");
    expect(svg.text).toContain("Cliente");
    expect(svg.text).toContain("&lt;&lt;include&gt;&gt;");

    const text = await request(app).get(`/api/v1/diagrams/${diagramId}/render/text`).expect(200);
    expect(text.body.actors).toEqual(["Cliente"]);
    expect(text.body.relationships).toHaveLength(2);
    expect(text.body.plainText).toContain("Fim da descrição do diagrama.");

    const json = await request(app).get(`/api/v1/diagrams/${diagramId}/render/json`).expect(200);
    expect(json.body.relationships).toHaveLength(2);
  });

  it("rejeita criação de diagrama sem título", async () => {
    const response = await request(app).post("/api/v1/diagrams").send({ title: "  " }).expect(400);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("lista diagramas criados", async () => {
    await request(app).post("/api/v1/diagrams").send({ title: "Diagrama A" }).expect(201);
    await request(app).post("/api/v1/diagrams").send({ title: "Diagrama B" }).expect(201);

    const response = await request(app).get("/api/v1/diagrams").expect(200);

    expect(response.body).toHaveLength(2);
  });

  it("retorna 404 ao buscar um diagrama inexistente", async () => {
    const response = await request(app).get("/api/v1/diagrams/id-inexistente").expect(404);
    expect(response.body.errors[0].code).toBe("DIAGRAM_NOT_FOUND");
  });

  it("remove atores, casos de uso e relacionamentos individualmente", async () => {
    const diagram = await request(app).post("/api/v1/diagrams").send({ title: "Sistema" }).expect(201);
    const diagramId = diagram.body.id as string;
    const actor = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/actors`)
      .send({ name: "Cliente" })
      .expect(201);
    const useCase = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/use-cases`)
      .send({ name: "Realizar Pedido" })
      .expect(201);
    const relationship = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: actor.body.id, targetId: useCase.body.id })
      .expect(201);

    await request(app)
      .delete(`/api/v1/diagrams/${diagramId}/relationships/${relationship.body.id}`)
      .expect(204);
    await request(app).delete(`/api/v1/diagrams/${diagramId}/actors/${actor.body.id}`).expect(204);
    await request(app).delete(`/api/v1/diagrams/${diagramId}/use-cases/${useCase.body.id}`).expect(204);

    const detail = await request(app).get(`/api/v1/diagrams/${diagramId}`).expect(200);
    expect(detail.body.actors).toHaveLength(0);
    expect(detail.body.useCases).toHaveLength(0);
    expect(detail.body.relationships).toHaveLength(0);
  });

  it("remove um diagrama e passa a retornar 404 para ele", async () => {
    const diagram = await request(app).post("/api/v1/diagrams").send({ title: "Sistema" }).expect(201);
    const diagramId = diagram.body.id as string;

    await request(app).delete(`/api/v1/diagrams/${diagramId}`).expect(204);
    await request(app).get(`/api/v1/diagrams/${diagramId}`).expect(404);
  });
});
