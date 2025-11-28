export type GridType = 'custom' | 'square';

export interface GridSettings {
  rows: number;
  columns: number;
  lineColor: string;
  lineOpacity: number;
  lineWidth: number;
  showLabels: boolean;
  gridType: GridType;
  adjustImageToFit: boolean;
}
