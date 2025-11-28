export type PaperUnit = 'mm';

export interface PaperFormat {
  name: string;
  width: number;
  height: number;
  unit: PaperUnit;
}

export const PAPER_FORMATS: PaperFormat[] = [
  { name: 'A2', width: 420, height: 594, unit: 'mm' },
  { name: 'A3', width: 297, height: 420, unit: 'mm' },
  { name: 'A4', width: 210, height: 297, unit: 'mm' },
  { name: 'A5', width: 148, height: 210, unit: 'mm' },
  { name: 'Letter', width: 216, height: 279, unit: 'mm' },
  { name: 'Legal', width: 216, height: 356, unit: 'mm' },
  { name: 'Custom', width: 0, height: 0, unit: 'mm' },
];
