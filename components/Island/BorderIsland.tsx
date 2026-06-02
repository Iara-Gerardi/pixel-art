"use client";
import React, { useMemo } from "react";
import { computeBorderSet, hashCoord as _hashCoord } from "../../utils/islandRenderer";

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

const hashCoord = _hashCoord;


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

  const borderSet = useMemo(() => computeBorderSet(bitmap, rows, cols), [bitmap, rows, cols]);

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
                  className={`text-sm`}
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
