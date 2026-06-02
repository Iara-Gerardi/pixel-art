"use client";
import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import Island from "./Island/Island";
import BorderIsland from "./Island/BorderIsland";
import type { IslandConfig } from "./types";
import { handleDownloadPNG, generatePNG } from "../utils/handleDownloadPNG"

interface Props {
  grid: number[][] | null;
  config: IslandConfig;
  isLoading: boolean;
}

export default function PreviewPanel({ grid, config, isLoading }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadScale, setDownloadScale] = useState(2);
  const [transparentBg, setTransparentBg] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "ref">("preview");
  const [refDataUrl, setRefDataUrl] = useState<string | null>(null);
  const [isGeneratingRef, setIsGeneratingRef] = useState(false);

  async function handleRefresh() {
    setIsGeneratingRef(true);
    try {
      const url = await generatePNG(grid, config, transparentBg);
      setRefDataUrl(url);
    } finally {
      setIsGeneratingRef(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-gray-900">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              activeTab === "preview"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => { setActiveTab("ref"); handleRefresh(); }}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              activeTab === "ref"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Ref
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-white/50 hover:text-white/70">
            <input
              type="checkbox"
              checked={transparentBg}
              onChange={(e) => setTransparentBg(e.target.checked)}
              disabled={!grid || isDownloading}
              className="accent-indigo-400 disabled:opacity-30"
            />
            Transparent
          </label>
          <select
            value={downloadScale}
            onChange={(e) => setDownloadScale(Number(e.target.value))}
            disabled={!grid || isDownloading}
            className="rounded-lg border border-white/10 bg-gray-900 px-2 py-1.5 text-sm text-white/60 focus:outline-none disabled:opacity-30"
          >
            {[1, 2, 3, 4].map((s) => (
              <option key={s} value={s}>{s}×</option>
            ))}
          </select>
          <button
            onClick={() => handleDownloadPNG(grid, config, isDownloading, setIsDownloading, downloadScale, transparentBg)}
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
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        {activeTab === "preview" ? (
          isLoading ? (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
              <span className="text-sm">Processing image…</span>
            </div>
          ) : grid ? (
            <div className="inline-block rounded-xl bg-gray-950 p-4">
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
          )
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 self-end">
              <button
                onClick={handleRefresh}
                disabled={!grid || isGeneratingRef}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isGeneratingRef ? (
                  <span className="size-3 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
                Refresh
              </button>
            </div>
            {isGeneratingRef ? (
              <div className="flex flex-col items-center gap-3 text-white/40">
                <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
                <span className="text-sm">Generating ref…</span>
              </div>
            ) : refDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={refDataUrl} alt="PNG export preview" className="max-w-full rounded-xl" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/20 select-none">
                <p className="text-sm">Click the tab or Refresh to render the export preview</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
