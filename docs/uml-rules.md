# Regras de relacionamento — Diagrama de Caso de Uso

Referência rápida das regras de UML implementadas pelo `RelationshipRuleEngine` (`api/src/domain/relationship/relationship-rule-engine.ts`). Toda tentativa de criar um relacionamento que viole uma destas regras é rejeitada pela API com **HTTP 422** e um código de erro.

## Quem pode se relacionar com quem

| Relacionamento | Entre Ator e Caso de Uso | Entre dois Atores | Entre dois Casos de Uso |
|---|:---:|:---:|:---:|
| **Associação** | ✅ único caso permitido | ❌ | ❌ |
| **Generalização** | ❌ | ✅ | ✅ |
| **Inclusão** (`<<include>>`) | ❌ | ❌ | ✅ |
| **Extensão** (`<<extend>>`) | ❌ | ❌ | ✅ |

## Associação

- Único relacionamento possível entre um Ator e um Caso de Uso; sempre binário.
- Pode ter uma direção (`direction`), representando a navegabilidade:
  - `TO_USE_CASE`: o ator fornece dados ao caso de uso.
  - `TO_ACTOR`: o caso de uso retorna informações ao ator.
  - `UNDIRECTED` (padrão): sem direção definida.

## Generalização

- Entre dois Atores **ou** entre dois Casos de Uso — nunca misturando os dois tipos.
- Convenção adotada: o elemento de **origem** (`sourceId`) é o mais específico; o elemento de **destino** (`targetId`) é o mais geral.

## Inclusão (`<<include>>`)

- Somente entre Casos de Uso.
- Convenção: a **origem** é o caso de uso *base*; o **destino** é o caso de uso *incluído*.
- É uma obrigatoriedade: executar o caso de uso base implica executar o incluído (equivalente a uma chamada de sub-rotina).

## Extensão (`<<extend>>`)

- Somente entre Casos de Uso.
- Convenção: a **origem** é o caso de uso de *extensão* (opcional); o **destino** é o caso de uso *base*.
- Modela comportamento **opcional**, que só ocorre se uma condição for satisfeita. A condição pode ser descrita em texto livre no campo `condition`.

## Outras regras estruturais (válidas para todos os tipos)

| Código de erro | Quando ocorre |
|---|---|
| `SELF_RELATIONSHIP` | Um elemento foi relacionado consigo mesmo. |
| `CROSS_DIAGRAM` | Origem e destino pertencem a diagramas diferentes. |
| `ELEMENT_NOT_FOUND` | `sourceId`/`targetId` não corresponde a um ator/caso de uso existente no diagrama. |
| `INVALID_PAIR_FOR_ASSOCIATION` | Associação fora do par Ator↔Caso de Uso. |
| `INVALID_PAIR_FOR_GENERALIZATION` | Generalização misturando Ator com Caso de Uso. |
| `INVALID_PAIR_FOR_INCLUDE` | Inclusão fora do par Caso de Uso↔Caso de Uso. |
| `INVALID_PAIR_FOR_EXTEND` | Extensão fora do par Caso de Uso↔Caso de Uso. |
| `DUPLICATE_RELATIONSHIP` | Já existe um relacionamento do mesmo tipo entre exatamente o mesmo par de elementos. |
