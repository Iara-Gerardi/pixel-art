"use client";
import { useRef, useState } from "react";
import { Upload, ChevronDown, ChevronUp } from "lucide-react";
import Island from "./Island/Island";
import { heartPattern } from "./Island/patterns/heart";
import { techHeartPattern } from "./Island/patterns/techHeart";
import { ornamentPattern } from "./Island/patterns/ornament";
import type { IslandConfig, RenderStyle, TextSize, IslandVariant } from "./types";

const PATTERNS = [
  { id: "heart", label: "Heart", grid: heartPattern },
  { id: "techHeart", label: "Tech Heart", grid: techHeartPattern },
  { id: "ornament", label: "Ornament", grid: ornamentPattern },
] as const;

const RENDER_STYLES: RenderStyle[] = ["default", "b&w", "numeric-island", "numeric-sea", "default-with-hover"];
const SQUARE_SIZES = ["size-0.5", "size-1", "size-1.5", "size-2", "size-3", "size-4"];
const TEXT_SIZES: TextSize[] = ["default", "md", "lg"];

interface Props {
  config: IslandConfig;
  onConfigChange: (c: IslandConfig) => void;
  onGridChange: (g: number[][] | null) => void;
  setIsLoading: (v: boolean) => void;
}

export default function UploadPanel({ config, onConfigChange, onGridChange, setIsLoading }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activePattern, setActivePattern] = useState<string | null>(null);
  const [rows, setRows] = useState(64);
  const [cols, setCols] = useState(64);
  const [threshold, setThreshold] = useState(128);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePatternClick(id: string, grid: number[][]) {
    setActivePattern(id);
    onGridChange(grid);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setActivePattern("upload");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("rows", String(rows));
      formData.append("cols", String(cols));
      formData.append("threshold", String(threshold));

      const res = await fetch("/api/pixelate", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Processing failed.");
        onGridChange(null);
      } else {
        onGridChange(data.grid);
      }
    } catch {
      setError("Network error. Please try again.");
      onGridChange(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <h1 className="text-lg font-semibold tracking-wide text-white">Pixel Art Studio</h1>

      {/* Preset patterns */}
      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Presets</p>
        <div className="flex flex-col gap-2">
          {PATTERNS.map(({ id, label, grid }) => (
            <button
              key={id}
              onClick={() => handlePatternClick(id, grid)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                activePattern === id
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {/* Tiny thumbnail */}
              <div className="pointer-events-none scale-[0.25] origin-left" style={{ width: 40, height: 40, overflow: "hidden", flexShrink: 0 }}>
                <Island bitmap={grid} squareSize="size-1" className="p-0!" />
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="relative flex items-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30">or upload</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition-colors ${
            activePattern === "upload"
              ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
              : "border-white/20 text-white/40 hover:border-white/40 hover:text-white/60"
          }`}
        >
          <Upload className="size-5" />
          <span>Click to select image</span>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => setActivePattern(null)} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40">Width (cols)</label>
            <input
              type="number"
              min={1}
              max={512}
              value={cols}
              onChange={(e) => setCols(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40">Height (rows)</label>
            <input
              type="number"
              min={1}
              max={512}
              value={rows}
              onChange={(e) => setRows(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Advanced: threshold */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50"
        >
          {showAdvanced ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          Advanced
        </button>
        {showAdvanced && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40">Threshold: {threshold}</label>
            <input
              type="range"
              min={0}
              max={255}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700"
        >
          Pixelate
        </button>
      </form>

      <div className="h-px bg-white/10" />

      {/* Config controls */}
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">Component Config</p>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Variant</label>
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {(["Island", "BorderIsland"] as IslandVariant[]).map((v) => (
              <button
                key={v}
                onClick={() => onConfigChange({ ...config, variant: v })}
                className={`flex-1 py-1.5 text-xs transition-colors ${
                  config.variant === v ? "bg-indigo-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Render Style</label>
          <select
            value={config.renderStyle}
            onChange={(e) => onConfigChange({ ...config, renderStyle: e.target.value as RenderStyle })}
            className="rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          >
            {RENDER_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Cell Size</label>
          <select
            value={config.squareSize}
            onChange={(e) => onConfigChange({ ...config, squareSize: e.target.value })}
            className="rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          >
            {SQUARE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Text Size</label>
          <select
            value={config.textSize}
            onChange={(e) => onConfigChange({ ...config, textSize: e.target.value as TextSize })}
            className="rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          >
            {TEXT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
