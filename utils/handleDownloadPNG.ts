
export async function handleDownloadPNG(
  previewRef: React.RefObject<HTMLDivElement | null>,
  isDownloading: boolean,
  setIsDownloading: (v: boolean) => void) {
    
  if (!previewRef?.current || isDownloading) return;
  setIsDownloading(true);

  // Yield so the spinner renders before we block the main thread.
  await new Promise<void>((resolve) => setTimeout(resolve, 50));

  try {
    const live = previewRef.current;

    // Clone the node so we can mutate styles without touching the live DOM.
    const clone = live.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);

    // Tailwind v4 emits oklch() colors which dom-to-image cannot composite.
    // getComputedStyle always returns resolved rgb() values, so we stamp
    // those onto every element in the clone before handing it off.
    const COLOR_PROPS = [
      "backgroundColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "color",
    ] as const;

    const liveEls = [live, ...Array.from(live.querySelectorAll("*"))] as HTMLElement[];
    const cloneEls = [clone, ...Array.from(clone.querySelectorAll("*"))] as HTMLElement[];

    liveEls.forEach((el, i) => {
      const computed = getComputedStyle(el);
      const target = cloneEls[i];
      if (!target) return;
      for (const prop of COLOR_PROPS) {
        const val = computed[prop];

        if (val) target.style[prop] = val;
      }
    });

    const domToImage = await import("dom-to-image-more");
    const dataUrl = await domToImage.default.toPng(clone, { scale: 2 });

    document.body.removeChild(clone);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "pixel-art.png";
    link.click();
  } finally {
    setIsDownloading(false);
  }
}
