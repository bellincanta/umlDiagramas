# Diagramas de Caso de Uso UML — Acessível

API + front-end para que alunos com deficiência visual criem e gerenciem diagramas de Caso de Uso da UML informando apenas dados textuais (nome de ator, nome de caso de uso, tipo de relacionamento), sem depender de manipulação gráfica como no Eclipse Papyrus.

- `api/` — back-end MVC em Express + TypeScript + Prisma, com o motor de regras de UML, persistência e três formatos de saída (Mermaid, descrição acessível, JSON).
- `web/` — front-end React + TypeScript, com formulários acessíveis (labels, `fieldset`/`legend`, região `aria-live`) e dois painéis de resultado: a descrição textual (referência canônica) e o diagrama visual em Mermaid (complemento para quem enxerga).
- `docs/uml-rules.md` — referência rápida das regras de relacionamento UML implementadas, útil para professor e alunos.

## Pré-requisitos

- Node.js 20+
- npm

## Rodando o back-end (`api/`)

```bash
cd api
npm install
cp .env.example .env      # ajuste DATABASE_URL para seu banco Postgres/Neon
npx prisma migrate dev    # aplica o schema no banco
npm run dev                # http://localhost:3000
```

Scripts úteis:

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API com reload automático (`tsx watch`) |
| `npm run build` / `npm start` | Compila para `dist/` e roda com Node puro |
| `npm test` | Roda os testes (unitários + integração) com Vitest |
| `npm run test:coverage` | Roda os testes com relatório de cobertura |
| `npm run prisma:migrate` | Cria/aplica uma nova migration |

### Banco de dados: Postgres (Neon)

O projeto usa Postgres via o driver serverless da Neon (`@prisma/adapter-neon`), que funciona tanto localmente quanto em ambientes serverless como a Vercel. Basta apontar `DATABASE_URL` (em `api/.env`) para a *connection string* do seu projeto Neon (painel do Neon → Connection Details → aba "Pooled connection").

> **Testes de integração:** `tests/helpers/test-db-url.ts` ainda referencia um banco SQLite local (`file:./test.db`) usado antes da migração para Postgres. Como o `datasource` do Prisma agora é `postgresql`, os testes de integração precisam de um Postgres real para rodar (uma branch separada no Neon, ou um Postgres local via Docker). Ajuste `TEST_DATABASE_URL` para apontar para esse banco antes de rodar `npm test`.

Para o passo a passo completo de deploy (Vercel + Neon), veja o guia gerado para este projeto.

## Rodando o front-end (`web/`)

Em outro terminal, com a API já rodando:

```bash
cd web
npm install
cp .env.example .env   # ajuste VITE_API_BASE_URL se a API não estiver em localhost:3000
npm run dev             # http://localhost:5173
```

Scripts úteis:

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o front-end com Vite |
| `npm run build` | Build de produção em `dist/` |
| `npm test` | Roda os testes de componente (Vitest + Testing Library + jest-axe) |

> A API só aceita requisições da origem configurada em `CORS_ORIGIN` (padrão `http://localhost:5173`, ver `api/.env.example`). Ajuste essa variável se o front-end rodar em outra porta/domínio.

## Exemplo de uso da API (sem o front-end)

```bash
BASE=http://localhost:3000/api/v1

# 1. Criar o diagrama
DIAGRAM_ID=$(curl -s -X POST $BASE/diagrams -H "Content-Type: application/json" \
  -d '{"title":"Sistema de Pedidos"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')

# 2. Criar um ator e dois casos de uso
ACTOR_ID=$(curl -s -X POST $BASE/diagrams/$DIAGRAM_ID/actors -H "Content-Type: application/json" \
  -d '{"name":"Cliente"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
UC1_ID=$(curl -s -X POST $BASE/diagrams/$DIAGRAM_ID/use-cases -H "Content-Type: application/json" \
  -d '{"name":"Realizar Pedido"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
UC2_ID=$(curl -s -X POST $BASE/diagrams/$DIAGRAM_ID/use-cases -H "Content-Type: application/json" \
  -d '{"name":"Validar Login"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')

# 3. Criar os relacionamentos
curl -s -X POST $BASE/diagrams/$DIAGRAM_ID/relationships -H "Content-Type: application/json" \
  -d "{\"type\":\"ASSOCIATION\",\"sourceId\":\"$ACTOR_ID\",\"targetId\":\"$UC1_ID\",\"direction\":\"TO_USE_CASE\"}"
curl -s -X POST $BASE/diagrams/$DIAGRAM_ID/relationships -H "Content-Type: application/json" \
  -d "{\"type\":\"INCLUDE\",\"sourceId\":\"$UC1_ID\",\"targetId\":\"$UC2_ID\"}"

# 4. Ver os três formatos de saída
curl -s $BASE/diagrams/$DIAGRAM_ID/render/json    # estrutura completa
curl -s $BASE/diagrams/$DIAGRAM_ID/render/text     # descrição acessível (cole no leitor de tela / fale em voz alta)
curl -s $BASE/diagrams/$DIAGRAM_ID/render/mermaid  # sintaxe Mermaid (cole em https://mermaid.live para visualizar)
```

### Endpoints

```
POST   /api/v1/diagrams                                    { title }
GET    /api/v1/diagrams
GET    /api/v1/diagrams/:diagramId
DELETE /api/v1/diagrams/:diagramId

POST   /api/v1/diagrams/:diagramId/actors                  { name }
DELETE /api/v1/diagrams/:diagramId/actors/:actorId

POST   /api/v1/diagrams/:diagramId/use-cases                { name }
DELETE /api/v1/diagrams/:diagramId/use-cases/:useCaseId

POST   /api/v1/diagrams/:diagramId/relationships             { type, sourceId, targetId, direction?, condition? }
DELETE /api/v1/diagrams/:diagramId/relationships/:relationshipId

GET    /api/v1/diagrams/:diagramId/render/mermaid   -> text/plain (sintaxe Mermaid)
GET    /api/v1/diagrams/:diagramId/render/text      -> JSON (descrição acessível)
GET    /api/v1/diagrams/:diagramId/render/json      -> JSON (estrutura completa)
```

`type` (relacionamento) é um de `ASSOCIATION | GENERALIZATION | INCLUDE | EXTEND`. As regras que determinam quais pares de elementos cada tipo aceita estão documentadas em [docs/uml-rules.md](docs/uml-rules.md).

Erros de violação de regra de UML retornam **422** com `{ "errors": [{ "code": "...", "message": "..." }] }`. Erros de formato de payload retornam **400** no mesmo formato.

## Arquitetura

- **Domínio** (`api/src/domain/`): classes de `Actor`, `UseCase` e `Relationship` (com subtipos `AssociationRelationship`, `GeneralizationRelationship`, `IncludeRelationship`, `ExtendRelationship`), cada uma validando suas próprias regras (Template Method) e se renderizando via Visitor pattern (`RelationshipVisitor<T>`). Cobertura de testes: 100%.
- **Models** (`api/src/models/`): camada de persistência (Prisma + repositórios + mappers Prisma↔domínio).
- **Views** (`api/src/views/`): os três renderizadores (`JsonRenderer`, `AccessibleTextRenderer`, `MermaidRenderer`), todos implementando `RelationshipVisitor`.
- **Controllers/Services/Routes** (`api/src/controllers`, `services`, `routes`): camada HTTP MVC.
- **Front-end** (`web/src/`): `api/` (client HTTP + hooks TanStack Query), `components/` (formulários, listas, painéis de saída), `pages/` (lista de diagramas, editor), `accessibility/` (região `aria-live` global).

A arquitetura foi desenhada para suportar outros diagramas UML no futuro (ex.: diagrama de classes) sem reescrever o núcleo: basta adicionar novos elementos de domínio, novas subclasses de `Relationship` reaproveitando o Template Method, e estender o `RelationshipVisitor`.
