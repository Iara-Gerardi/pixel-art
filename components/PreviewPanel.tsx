"use client";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import Island from "./Island/Island";
import BorderIsland from "./Island/BorderIsland";
import type { IslandConfig } from "./types";
import { handleDownloadPNG } from "../utils/handleDownloadPNG"

interface Props {
  grid: number[][] | null;
  config: IslandConfig;
  isLoading: boolean;
}

export default function PreviewPanel({ grid, config, isLoading }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-gray-900">
        <span className="text-sm text-white/50">Preview</span>
        <button
          onClick={() => handleDownloadPNG(previewRef, isDownloading, setIsDownloading)}
          disabled={!grid || isDownloading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isDownloading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          ) : (
            <Download className="size-4" />
          )}
          {isDownloading ? "Exporting…" : "Download PNG"}
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-white/40">
            <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
            <span className="text-sm">Processing image…</span>
          </div>
        ) : grid ? (
          <div ref={previewRef} className="inline-block rounded-xl bg-gray-950 p-4">
            {config.variant === "Island" ? (
              <Island
                bitmap={grid}
                renderStyle={config.renderStyle}
                squareSize={config.squareSize}
                textSize={config.textSize}
                className="p-0!"
              />
            ) : (
              <BorderIsland
                bitmap={grid}
                colors={config.borderColors}
                squareSize={config.squareSize}
                className="p-0!"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/20 select-none">
            <svg className="size-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Select a preset or upload an image to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
