"use client";
import React, { useMemo } from "react";
import { computeBorderMap } from "../../utils/islandRenderer";

type renderType =
  | "default"
  | "numeric-island"
  | "numeric-sea"
  | "default-with-hover"
  | "b&w";

type textSize = "default" | "md" | "lg";

interface Props {
  bitmap: number[][];
  renderStyle?: renderType;
  textSize?: textSize;
  className?: string;
  squareSize?: number | string;
}

function Island({
  bitmap,
  renderStyle = "default",
  textSize = "default",
  className = "",
  squareSize = "size-1",
}: Props) {
  const rows = bitmap.length;
  const cols = bitmap[0]?.length ?? 0;

  const getBorder = (val: boolean) => {
    if (renderStyle === "b&w") return val ? "2px solid #000" : "0px";
    return val ? "2px solid #372aac" : "0px solid #ddd";
  };

  const borderMap = useMemo(() => computeBorderMap(bitmap, rows, cols), [bitmap, rows, cols]);

  return (
    <div className={`flex items-center justify-center p-5 ${className}`}>
      <div
        className={`grid p-5 ${renderStyle === "b&w" ? "gap-1.5" : "gap-0"}`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {bitmap.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((cell, colIdx) => {
              const key = `${rowIdx},${colIdx}`;
              const borders = borderMap[key];

              const borderStyle = borders
                ? {
                    borderTop: getBorder(borders.top),
                    borderBottom: getBorder(borders.bottom),
                    borderLeft: getBorder(borders.left),
                    borderRight: getBorder(borders.right),
                  }
                : {};

              return (
                <div
                  key={key}
                  className={`${squareSize} flex items-center justify-center
                    ${textSize === "md" ? "text-[8px]" : textSize === "lg" ? "text-xs" : "text-[5px]"}
                    ${(renderStyle === "default" || renderStyle === "default-with-hover") && cell === 1 ? "bg-indigo-400/20" : ""}`}
                  style={
                    cell === 1
                      ? borderStyle
                      : renderStyle === "numeric-sea"
                        ? {
                            backgroundColor: "rgba(129, 140, 248, 0.2)",
                            color: "white",
                          }
                        : {}
                  }
                >
                  {renderStyle === "default-with-hover" && (
                    <p className="flex items-center justify-center opacity-0 hover:opacity-100 relative z-30 size-full transition-all duration-300">
                      {cell}
                    </p>
                  )}
                  {renderStyle === "numeric-sea" && cell === 0 && (
                    <p className="text-indigo-400 p-1">0</p>
                  )}
                  {renderStyle === "numeric-island" && cell === 1 && (
                    <p className="text-indigo-400 p-1">1</p>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default Island;
