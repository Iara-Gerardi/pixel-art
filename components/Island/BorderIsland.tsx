"use client";
import React, { useMemo } from "react";

interface Props {
  bitmap: number[][];
  colors: string[];
  className?: string;
  squareSize?: string;
  /** When true, renders ASCII characters on border cells instead of colored pixel blocks. */
  ascii?: boolean;
  /** Pool of characters to randomly pick from for each border cell when ascii=true. */
  asciiChars?: string[];
}

/**
 * Deterministic hash of (row, col) → index in [0, mod).
 * Uses integer bit-mixing so each coordinate pair maps consistently
 * to a color without Math.random (avoids hydration mismatches).
 */
function hashCoord(row: number, col: number, mod: number): number {
  return (((row * 73856093) ^ (col * 19349663)) >>> 0) % mod;
}

const DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

export default function BorderIsland({
  bitmap,
  colors,
  className = "",
  squareSize = "size-1",
  ascii = false,
  asciiChars = ["#"],
}: Props) {
  const rows = bitmap.length;
  const cols = bitmap[0]?.length ?? 0;

  /**
   * borderSet contains "row,col" keys for every land cell that has at least
   * one adjacent water cell (including grid edges treated as water).
   */
  const borderSet = useMemo(() => {
    const set = new Set<string>();

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (bitmap[i][j] !== 1) continue;

        const isBorder = DIRECTIONS.some(([di, dj]) => {
          const ni = i + di;
          const nj = j + dj;
          // Out-of-bounds counts as water
          if (ni < 0 || ni >= rows || nj < 0 || nj >= cols) return true;
          return bitmap[ni][nj] === 0;
        });

        if (isBorder) set.add(`${i},${j}`);
      }
    }

    return set;
  }, [bitmap, rows, cols]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          ...(ascii ? { fontFamily: "monospace", lineHeight: 1 } : {}),
        }}
      >
        {bitmap.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const key = `${rowIdx},${colIdx}`;
            const isBorderCell = borderSet.has(key);

            const color =
              cell === 1 && isBorderCell && colors.length > 0
                ? colors[hashCoord(rowIdx, colIdx, colors.length)]
                : undefined;

            if (ascii) {
              // Only border cells show a character; everything else is a blank placeholder.
              const char = isBorderCell
                ? asciiChars[hashCoord(rowIdx, colIdx, asciiChars.length)]
                : "";

              return (
                <span
                  key={key}
                  className={`text-sm!`}
                  style={isBorderCell ? { color, userSelect: "none" } : undefined}
                >
                  {char}
                </span>
              );
            }

            return (
              <div
                key={key}
                className={squareSize}
                style={color ? { backgroundColor: color } : undefined}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
