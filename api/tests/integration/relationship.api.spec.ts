import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, resetDatabase } from "../helpers/test-app.js";

beforeEach(async () => {
  await resetDatabase();
});

async function createDiagramWithElements() {
  const diagram = await request(app).post("/api/v1/diagrams").send({ title: "Sistema" }).expect(201);
  const diagramId = diagram.body.id as string;

  const actor1 = await request(app)
    .post(`/api/v1/diagrams/${diagramId}/actors`)
    .send({ name: "Cliente" })
    .expect(201);
  const actor2 = await request(app)
    .post(`/api/v1/diagrams/${diagramId}/actors`)
    .send({ name: "Administrador" })
    .expect(201);
  const useCase1 = await request(app)
    .post(`/api/v1/diagrams/${diagramId}/use-cases`)
    .send({ name: "Realizar Pedido" })
    .expect(201);
  const useCase2 = await request(app)
    .post(`/api/v1/diagrams/${diagramId}/use-cases`)
    .send({ name: "Validar Login" })
    .expect(201);

  return { diagramId, actor1: actor1.body, actor2: actor2.body, useCase1: useCase1.body, useCase2: useCase2.body };
}

describe("Relationship API — catálogo de validação", () => {
  it("rejeita ASSOCIATION entre dois casos de uso (INVALID_PAIR_FOR_ASSOCIATION)", async () => {
    const { diagramId, useCase1, useCase2 } = await createDiagramWithElements();

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: useCase1.id, targetId: useCase2.id })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("INVALID_PAIR_FOR_ASSOCIATION");
  });

  it("rejeita GENERALIZATION misturando ator e caso de uso (INVALID_PAIR_FOR_GENERALIZATION)", async () => {
    const { diagramId, actor1, useCase1 } = await createDiagramWithElements();

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "GENERALIZATION", sourceId: actor1.id, targetId: useCase1.id })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("INVALID_PAIR_FOR_GENERALIZATION");
  });

  it("rejeita INCLUDE entre ator e caso de uso (INVALID_PAIR_FOR_INCLUDE)", async () => {
    const { diagramId, actor1, useCase1 } = await createDiagramWithElements();

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "INCLUDE", sourceId: actor1.id, targetId: useCase1.id })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("INVALID_PAIR_FOR_INCLUDE");
  });

  it("rejeita EXTEND entre ator e caso de uso (INVALID_PAIR_FOR_EXTEND)", async () => {
    const { diagramId, actor1, useCase1 } = await createDiagramWithElements();

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "EXTEND", sourceId: actor1.id, targetId: useCase1.id })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("INVALID_PAIR_FOR_EXTEND");
  });

  it("rejeita autorrelacionamento (SELF_RELATIONSHIP)", async () => {
    const { diagramId, actor1, useCase1 } = await createDiagramWithElements();

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: actor1.id, targetId: actor1.id })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("SELF_RELATIONSHIP");
    void useCase1;
  });

  it("rejeita relacionamento com elemento inexistente (ELEMENT_NOT_FOUND)", async () => {
    const { diagramId, actor1 } = await createDiagramWithElements();

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: actor1.id, targetId: "00000000-0000-0000-0000-000000000000" })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("ELEMENT_NOT_FOUND");
  });

  it("rejeita relacionamento duplicado (DUPLICATE_RELATIONSHIP)", async () => {
    const { diagramId, actor1, useCase1 } = await createDiagramWithElements();

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: actor1.id, targetId: useCase1.id })
      .expect(201);

    const response = await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: actor1.id, targetId: useCase1.id })
      .expect(422);

    expect(response.body.errors.map((e: { code: string }) => e.code)).toContain("DUPLICATE_RELATIONSHIP");
  });

  it("aceita ASSOCIATION, GENERALIZATION, INCLUDE e EXTEND quando válidos", async () => {
    const { diagramId, actor1, actor2, useCase1, useCase2 } = await createDiagramWithElements();

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "ASSOCIATION", sourceId: actor1.id, targetId: useCase1.id })
      .expect(201);

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "GENERALIZATION", sourceId: actor2.id, targetId: actor1.id })
      .expect(201);

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({ type: "INCLUDE", sourceId: useCase1.id, targetId: useCase2.id })
      .expect(201);

    await request(app)
      .post(`/api/v1/diagrams/${diagramId}/relationships`)
      .send({
        type: "EXTEND",
        sourceId: useCase2.id,
        targetId: useCase1.id,
        condition: "condição opcional satisfeita",
      })
      .expect(201);

    const detail = await request(app).get(`/api/v1/diagrams/${diagramId}`).expect(200);
    expect(detail.body.relationships).toHaveLength(4);
  });
});
