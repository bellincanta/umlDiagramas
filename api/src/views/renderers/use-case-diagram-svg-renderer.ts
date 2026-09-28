import { AssociationDirection, type AssociationRelationship } from "../../domain/relationship/association-relationship.js";
import type { ExtendRelationship } from "../../domain/relationship/extend-relationship.js";
import type { GeneralizationRelationship } from "../../domain/relationship/generalization-relationship.js";
import type { IncludeRelationship } from "../../domain/relationship/include-relationship.js";
import type { RelationshipVisitor } from "../../domain/relationship/relationship-visitor.js";
import { Actor } from "../../domain/usecase/actor.js";
import type { UseCaseDiagram } from "../../domain/usecase/use-case-diagram.js";

// ── Constantes de layout ──────────────────────────────────────────────────────

/** Centro X dos atores (coluna da esquerda). */
const ACTOR_CX = 80;
/** Altura vertical alocada por ator (boneco + label). */
const ACTOR_ROW_H = 130;
/** Y do centro do primeiro ator. */
const ACTOR_START_Y = 90;

/** Raio do head do boneco-palito (UML actor). */
const HEAD_R = 11;
/** Tamanho do corpo do boneco abaixo da cabeça. */
const BODY_H = 22;
/** Comprimento de cada braço. */
const ARM_LEN = 15;
/** Comprimento de cada perna (em X e Y). */
const LEG_DX = 12;
const LEG_DY = 20;

/** Semieixo da "elipse virtual" usada para calcular o ponto de conexão de
 *  linhas no ator (não é desenhada — só para geometria). */
const ACTOR_CONN_RX = 20;
const ACTOR_CONN_RY = 50;

/** Margem interna à esquerda/direita do retângulo do sistema. */
const BOUNDARY_HPAD = 40;
/** Distância entre a coluna dos atores e o limite esquerdo do retângulo. */
const ACTOR_TO_BOUNDARY = 100;

/** Semieixo Y das elipses de caso de uso. */
const UC_RY = 34;
/** Altura vertical alocada por caso de uso. */
const UC_ROW_H = 110;
/** Y do centro do primeiro caso de uso. */
const UC_START_Y = 90;

// ── Tipos internos ────────────────────────────────────────────────────────────

interface NodeGeom {
  cx: number;
  cy: number;
  rx: number; // semieixo para intersecção de linha (pode ser virtual)
  ry: number;
}

// ── Renderizador ──────────────────────────────────────────────────────────────

/**
 * Gera um SVG seguindo o padrão UML de Diagrama de Caso de Uso:
 * - Ator: boneco-palito com label abaixo.
 * - Caso de Uso: elipse com label interno.
 * - Limite do sistema: retângulo com o título do diagrama.
 * - Generalização: seta com triângulo vazio (↑).
 * - Inclusão / Extensão: seta tracejada com rótulo <<include>> / <<extend>>.
 */
export class UseCaseDiagramSvgRenderer {
  render(diagram: UseCaseDiagram): string {
    const actors = diagram.actors;
    const useCases = diagram.useCases;

    if (actors.length === 0 && useCases.length === 0) {
      return buildEmptySvg(diagram.title);
    }

    // ── Calcula geometria dos casos de uso ────────────────────────────────────
    const ucRxByName = (name: string): number => {
      const len = name.length;
      if (len <= 14) return 72;
      if (len <= 24) return 90;
      return 112;
    };

    const maxUcRx = useCases.reduce((max, uc) => Math.max(max, ucRxByName(uc.name)), 72);

    const boundaryLeft = ACTOR_CX + ACTOR_TO_BOUNDARY;
    const boundaryTop = Math.min(ACTOR_START_Y, UC_START_Y) - 55;
    const ucCx = boundaryLeft + BOUNDARY_HPAD + maxUcRx;
    const boundaryWidth = maxUcRx * 2 + BOUNDARY_HPAD * 2;
    const boundaryHeight =
      Math.max(useCases.length, 1) * UC_ROW_H + 60 + 30;

    // ── Mapa de geometria por elementId ───────────────────────────────────────
    const nodes = new Map<string, NodeGeom>();

    actors.forEach((actor, idx) => {
      const cy = ACTOR_START_Y + idx * ACTOR_ROW_H;
      nodes.set(actor.id, { cx: ACTOR_CX, cy, rx: ACTOR_CONN_RX, ry: ACTOR_CONN_RY });
    });

    useCases.forEach((uc, idx) => {
      const rx = ucRxByName(uc.name);
      const cy = UC_START_Y + 30 + idx * UC_ROW_H;
      nodes.set(uc.id, { cx: ucCx, cy, rx, ry: UC_RY });
    });

    const getNode = (id: string): NodeGeom => {
      const n = nodes.get(id);
      if (!n) throw new Error(`Nó de layout não encontrado: ${id}`);
      return n;
    };

    // ── Visitor inline (acessa `nodes` via closure) ───────────────────────────
    const edgeVisitor: RelationshipVisitor<string> = {
      visitAssociation(r: AssociationRelationship): string {
        const srcGeom = getNode(r.source.id);
        const tgtGeom = getNode(r.target.id);
        const actorGeom = r.source instanceof Actor ? srcGeom : tgtGeom;
        const ucGeom = r.source instanceof Actor ? tgtGeom : srcGeom;

        if (r.direction === AssociationDirection.UNDIRECTED) {
          return drawLine(actorGeom, ucGeom, {});
        }
        const [from, to] =
          r.direction === AssociationDirection.TO_USE_CASE
            ? [actorGeom, ucGeom]
            : [ucGeom, actorGeom];
        return drawLine(from, to, { marker: "assoc-arrow" });
      },

      visitGeneralization(r: GeneralizationRelationship): string {
        return drawLine(getNode(r.source.id), getNode(r.target.id), { marker: "hollow-triangle" });
      },

      visitInclude(r: IncludeRelationship): string {
        return drawLine(getNode(r.source.id), getNode(r.target.id), {
          dashed: true,
          marker: "open-arrow",
          label: "<<include>>",
        });
      },

      visitExtend(r: ExtendRelationship): string {
        return drawLine(getNode(r.source.id), getNode(r.target.id), {
          dashed: true,
          marker: "open-arrow",
          label: "<<extend>>",
        });
      },
    };

    const edges = diagram.relationships.map((r) => r.accept(edgeVisitor));

    const svgWidth = boundaryLeft + boundaryWidth + 40;
    const svgHeight =
      Math.max(
        ACTOR_START_Y + actors.length * ACTOR_ROW_H,
        boundaryTop + boundaryHeight,
      ) + 50;

    const parts: string[] = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" font-family="sans-serif" font-size="13">`,
    );
    parts.push(MARKER_DEFS);

    // Limite do sistema
    if (useCases.length > 0) {
      parts.push(
        `<rect x="${boundaryLeft}" y="${boundaryTop}" width="${boundaryWidth}" height="${boundaryHeight}" fill="none" stroke="#333" stroke-width="1.5" rx="2" />`,
        `<text x="${boundaryLeft + 10}" y="${boundaryTop + 18}" font-weight="bold" font-size="13" fill="#333">${xml(diagram.title)}</text>`,
      );
    }

    // Arestas (desenhadas antes dos nós para ficarem abaixo dos shapes)
    parts.push(...edges);

    // Atores
    actors.forEach((actor) => {
      const { cx, cy } = nodes.get(actor.id)!;
      parts.push(actorSvg(cx, cy, actor.name));
    });

    // Casos de uso
    useCases.forEach((uc) => {
      const { cx, cy, rx } = nodes.get(uc.id)!;
      parts.push(useCaseSvg(cx, cy, rx, UC_RY, uc.name));
    });

    parts.push("</svg>");
    return parts.join("\n");
  }
}

// ── Primitivas SVG ────────────────────────────────────────────────────────────

function actorSvg(cx: number, topCy: number, name: string): string {
  // topCy = ponto "centro de conexão" vertical do ator
  // O boneco é centrado verticalmente em torno de topCy
  const hcy = topCy - 30; // centro da cabeça
  const bodyTop = hcy + HEAD_R;
  const bodyBot = bodyTop + BODY_H;
  const armY = bodyTop + 7;
  const legEndY = bodyBot + LEG_DY;
  const labelY = legEndY + 17;

  return [
    "<g>",
    // cabeça
    `<circle cx="${cx}" cy="${hcy}" r="${HEAD_R}" fill="white" stroke="#222" stroke-width="1.4"/>`,
    // corpo
    `<line x1="${cx}" y1="${bodyTop}" x2="${cx}" y2="${bodyBot}" stroke="#222" stroke-width="1.4"/>`,
    // braços
    `<line x1="${cx - ARM_LEN}" y1="${armY}" x2="${cx + ARM_LEN}" y2="${armY}" stroke="#222" stroke-width="1.4"/>`,
    // pernas
    `<line x1="${cx}" y1="${bodyBot}" x2="${cx - LEG_DX}" y2="${legEndY}" stroke="#222" stroke-width="1.4"/>`,
    `<line x1="${cx}" y1="${bodyBot}" x2="${cx + LEG_DX}" y2="${legEndY}" stroke="#222" stroke-width="1.4"/>`,
    // label
    `<text x="${cx}" y="${labelY}" text-anchor="middle" fill="#111">${xml(name)}</text>`,
    "</g>",
  ].join("");
}

function useCaseSvg(cx: number, cy: number, rx: number, ry: number, name: string): string {
  const maxChars = Math.max(10, Math.floor((rx * 1.7) / 7));
  const lines = wordWrap(name, maxChars).slice(0, 3);
  const lineH = 16;
  const startOffset = -((lines.length - 1) * lineH) / 2;

  const tspans = lines
    .map((line, i) => `<tspan x="${cx}" dy="${i === 0 ? startOffset : lineH}">${xml(line)}</tspan>`)
    .join("");

  return [
    "<g>",
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white" stroke="#222" stroke-width="1.4"/>`,
    `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="#111">${tspans}</text>`,
    "</g>",
  ].join("");
}

// ── Arestas ───────────────────────────────────────────────────────────────────

interface LineOpts {
  dashed?: boolean;
  marker?: "assoc-arrow" | "hollow-triangle" | "open-arrow";
  label?: string;
}

function drawLine(from: NodeGeom, to: NodeGeom, opts: LineOpts): string {
  const start = ellipseEdgePoint(from, to.cx, to.cy);
  const end = ellipseEdgePoint(to, from.cx, from.cy);

  const x1 = start.x.toFixed(1);
  const y1 = start.y.toFixed(1);
  const x2 = end.x.toFixed(1);
  const y2 = end.y.toFixed(1);

  const dash = opts.dashed ? ` stroke-dasharray="7,5"` : "";
  const mkr = opts.marker ? ` marker-end="url(#${opts.marker})"` : "";

  const parts = [
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#222" stroke-width="1.4"${dash}${mkr}/>`,
  ];

  if (opts.label) {
    const mx = ((start.x + end.x) / 2).toFixed(1);
    const my = ((start.y + end.y) / 2 - 8).toFixed(1);
    parts.push(
      `<text x="${mx}" y="${my}" text-anchor="middle" font-style="italic" fill="#222">${xml(opts.label)}</text>`,
    );
  }

  return parts.join("");
}

/** Ponto na fronteira da elipse de `node` na direção de (px, py). */
function ellipseEdgePoint(node: NodeGeom, px: number, py: number): { x: number; y: number } {
  const dx = px - node.cx;
  const dy = py - node.cy;
  if (dx === 0 && dy === 0) return { x: node.cx, y: node.cy };
  const t = 1 / Math.sqrt((dx * dx) / (node.rx * node.rx) + (dy * dy) / (node.ry * node.ry));
  return { x: node.cx + dx * t, y: node.cy + dy * t };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function wordWrap(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function xml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmptySvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="300" height="80" font-family="sans-serif"><text x="150" y="40" text-anchor="middle" fill="#888">${xml(title)} — diagrama vazio</text></svg>`;
}

// ── Definições de marcadores de seta ─────────────────────────────────────────

const MARKER_DEFS = `<defs>
  <!-- Associação direcional: triângulo sólido preenchido -->
  <marker id="assoc-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto-start-reverse" markerUnits="strokeWidth">
    <path d="M0,0 L10,4 L0,8 Z" fill="#222"/>
  </marker>
  <!-- Generalização UML: triângulo vazio (preenchimento branco sobre a linha) -->
  <marker id="hollow-triangle" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto-start-reverse" markerUnits="strokeWidth">
    <path d="M0,0 L12,5 L0,10 Z" fill="white" stroke="#222" stroke-width="1"/>
  </marker>
  <!-- Inclusão / Extensão: ponta aberta em V -->
  <marker id="open-arrow" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto-start-reverse" markerUnits="strokeWidth">
    <path d="M0,0 L11,5 L0,10" fill="none" stroke="#222" stroke-width="1.2"/>
  </marker>
</defs>`;
