import type { IslandConfig } from "../components/types";
import { renderToDataURL } from "./islandRenderer";

export async function handleDownloadPNG(
  grid: number[][] | null,
  config: IslandConfig,
  isDownloading: boolean,
  setIsDownloading: (v: boolean) => void,
  scale = 2,
  transparent = false
): Promise<void> {
  if (!grid || isDownloading) return;
  setIsDownloading(true);

  // Yield so the spinner renders before we block the main thread.
  await new Promise<void>((resolve) => setTimeout(resolve, 50));

  try {
    const dataUrl = renderToDataURL(grid, config, scale, transparent);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "pixel-art.png";
    link.click();
  } finally {
    setIsDownloading(false);
  }
}

/** Returns the PNG data URL for the current grid/config without triggering a download. */
export async function generatePNG(
  grid: number[][] | null,
  config: IslandConfig,
  transparent = false
): Promise<string | null> {
  if (!grid) return null;
  return renderToDataURL(grid, config, 1, transparent);
}
