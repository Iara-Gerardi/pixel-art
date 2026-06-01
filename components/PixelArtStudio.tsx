"use client";
import { useState } from "react";
import UploadPanel from "./UploadPanel";
import PreviewPanel from "./PreviewPanel";
import type { IslandConfig } from "./types";

export type { RenderStyle, TextSize, IslandVariant, IslandConfig } from "./types";

const DEFAULT_CONFIG: IslandConfig = {
  renderStyle: "default",
  squareSize: "size-1",
  textSize: "default",
  variant: "Island",
  borderColors: ["#818cf8", "#6366f1", "#4f46e5", "#a5b4fc"],
};

export default function PixelArtStudio() {
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<IslandConfig>(DEFAULT_CONFIG);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950 text-white">
      {/* Left panel */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-white/10 bg-gray-900">
        <UploadPanel
          config={config}
          onConfigChange={setConfig}
          onGridChange={setGrid}
          setIsLoading={setIsLoading}
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto">
        <PreviewPanel grid={grid} config={config} isLoading={isLoading} />
      </div>
    </div>
  );
}
