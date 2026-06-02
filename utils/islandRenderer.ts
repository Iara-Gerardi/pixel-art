import type { IslandConfig, RenderStyle } from "../components/types";

// ─── Shared data structures ────────────────────────────────────────────────

export type BorderMap = Record<string, { top: boolean; bottom: boolean; left: boolean; right: boolean }>;

const DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

// ─── Shared logic (used by both React components and canvas renderer) ──────

export function computeBorderMap(
  bitmap: number[][],
  rows: number,
  cols: number
): BorderMap {
  const map: BorderMap = {};

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (bitmap[i][j] === 0) continue;

      map[`${i},${j}`] = {
        top: i > 0 ? bitmap[i - 1][j] === 0 : true,
        bottom: i < rows - 1 ? bitmap[i + 1][j] === 0 : true,
        left: j > 0 ? bitmap[i][j - 1] === 0 : true,
        right: j < cols - 1 ? bitmap[i][j + 1] === 0 : true,
      };
    }
  }

  return map;
}

export function computeBorderSet(
  bitmap: number[][],
  rows: number,
  cols: number
): Set<string> {
  const set = new Set<string>();

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (bitmap[i][j] !== 1) continue;

      const isBorder = DIRECTIONS.some(([di, dj]) => {
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || ni >= rows || nj < 0 || nj >= cols) return true;
        return bitmap[ni][nj] === 0;
      });

      if (isBorder) set.add(`${i},${j}`);
    }
  }

  return set;
}

/** Deterministic hash of (row, col) → index in [0, mod). */
export function hashCoord(row: number, col: number, mod: number): number {
  return (((row * 73856093) ^ (col * 19349663)) >>> 0) % mod;
}

/** Parse a Tailwind `size-N` class to pixels. e.g. "size-1" → 4, "size-2" → 8. */
export function squareSizeToPx(squareSize: string): number {
  const match = squareSize.match(/^size-(\d+(?:\.\d+)?)$/);
  if (!match) return 4;
  return parseFloat(match[1]) * 4;
}

// ─── Canvas rendering ──────────────────────────────────────────────────────

const BORDER_WIDTH = 2;
const BG_COLOR = "#030712"; // gray-950
const LAND_FILL = "rgba(129, 140, 248, 0.2)"; // indigo-400/20
const SEA_FILL = "rgba(129, 140, 248, 0.2)";
const BORDER_COLOR = "#372aac";
const BW_BORDER_COLOR = "#000";
const TEXT_COLOR = "#818cf8"; // indigo-400

function drawBorderSides(
  ctx: CanvasRenderingContext2D,
  borderMap: BorderMap,
  row: number,
  col: number,
  x: number,
  y: number,
  cellPx: number,
  color: string
): void {
  const borders = borderMap[`${row},${col}`];
  if (!borders) return;

  ctx.fillStyle = color;
  if (borders.top) ctx.fillRect(x, y, cellPx, BORDER_WIDTH);
  if (borders.bottom) ctx.fillRect(x, y + cellPx - BORDER_WIDTH, cellPx, BORDER_WIDTH);
  if (borders.left) ctx.fillRect(x, y, BORDER_WIDTH, cellPx);
  if (borders.right) ctx.fillRect(x + cellPx - BORDER_WIDTH, y, BORDER_WIDTH, cellPx);
}

function drawCellText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  cellPx: number,
  color: string
): void {
  const fontSize = Math.max(Math.floor(cellPx * 0.65), 5);
  ctx.font = `${fontSize}px monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + cellPx / 2, y + cellPx / 2);
}

export function drawIslandToCanvas(
  canvas: HTMLCanvasElement,
  bitmap: number[][],
  renderStyle: RenderStyle,
  cellPx: number,
  transparent = false
): void {
  const rows = bitmap.length;
  const cols = bitmap[0]?.length ?? 0;

  // b&w uses gap-1.5 (6px) between cells
  const gap = renderStyle === "b&w" ? 6 : 0;
  const stride = cellPx + gap;

  canvas.width = cols > 0 ? cols * cellPx + (cols - 1) * gap : 0;
  canvas.height = rows > 0 ? rows * cellPx + (rows - 1) * gap : 0;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (!transparent) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const borderMap = computeBorderMap(bitmap, rows, cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * stride;
      const y = i * stride;
      const cell = bitmap[i][j];

      if (renderStyle === "default" || renderStyle === "default-with-hover") {
        if (cell === 1) {
          ctx.fillStyle = LAND_FILL;
          ctx.fillRect(x, y, cellPx, cellPx);
          drawBorderSides(ctx, borderMap, i, j, x, y, cellPx, BORDER_COLOR);
        }
        // sea cells: transparent — bg already drawn

      } else if (renderStyle === "numeric-sea") {
        if (cell === 0) {
          ctx.fillStyle = SEA_FILL;
          ctx.fillRect(x, y, cellPx, cellPx);
          drawCellText(ctx, "0", x, y, cellPx, TEXT_COLOR);
        } else {
          // land cell: conditional borders only, no fill
          drawBorderSides(ctx, borderMap, i, j, x, y, cellPx, BORDER_COLOR);
        }

      } else if (renderStyle === "numeric-island") {
        if (cell === 1) {
          drawBorderSides(ctx, borderMap, i, j, x, y, cellPx, BORDER_COLOR);
          drawCellText(ctx, "1", x, y, cellPx, TEXT_COLOR);
        }
        // sea cells: transparent

      } else if (renderStyle === "b&w") {
        if (cell === 1) {
          drawBorderSides(ctx, borderMap, i, j, x, y, cellPx, BW_BORDER_COLOR);
        }
      }
    }
  }
}

export function drawBorderIslandToCanvas(
  canvas: HTMLCanvasElement,
  bitmap: number[][],
  colors: string[],
  cellPx: number,
  transparent = false
): void {
  const rows = bitmap.length;
  const cols = bitmap[0]?.length ?? 0;

  canvas.width = cols * cellPx;
  canvas.height = rows * cellPx;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (!transparent) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const borderSet = computeBorderSet(bitmap, rows, cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const key = `${i},${j}`;
      if (bitmap[i][j] === 1 && borderSet.has(key) && colors.length > 0) {
        ctx.fillStyle = colors[hashCoord(i, j, colors.length)];
        ctx.fillRect(j * cellPx, i * cellPx, cellPx, cellPx);
      }
    }
  }
}

/** Render grid to an off-screen canvas and return its data URL. scale=1 for Ref tab, scale=2 for download. */
export function renderToDataURL(
  bitmap: number[][],
  config: IslandConfig,
  scale = 1,
  transparent = false
): string {
  const canvas = document.createElement("canvas");
  const cellPx = squareSizeToPx(config.squareSize) * scale;

  if (config.variant === "Island") {
    drawIslandToCanvas(canvas, bitmap, config.renderStyle, cellPx, transparent);
  } else {
    drawBorderIslandToCanvas(canvas, bitmap, config.borderColors, cellPx, transparent);
  }

  return canvas.toDataURL("image/png");
}
