declare module "dom-to-image-more" {
  interface Options {
    bgcolor?: string;
    width?: number;
    height?: number;
    scale?: number;
    style?: Partial<CSSStyleDeclaration>;
    quality?: number;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  function toPng(node: HTMLElement, options?: Options): Promise<string>;
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  function toBlob(node: HTMLElement, options?: Options): Promise<Blob | null>;
  function toPixelData(
    node: HTMLElement,
    options?: Options
  ): Promise<Uint8ClampedArray>;

  export default { toPng, toJpeg, toSvg, toBlob, toPixelData };
}
