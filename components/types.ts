export type RenderStyle = "default" | "numeric-island" | "numeric-sea" | "default-with-hover" | "b&w";
export type TextSize = "default" | "md" | "lg";
export type IslandVariant = "Island" | "BorderIsland";

export interface IslandConfig {
  renderStyle: RenderStyle;
  squareSize: string;
  textSize: TextSize;
  variant: IslandVariant;
  borderColors: string[];
}
