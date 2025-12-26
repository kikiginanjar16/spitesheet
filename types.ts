
export interface SpriteFrame {
  id: string;
  url: string;
  blob?: Blob;
}

export interface SpriteSheetConfig {
  rows: number;
  cols: number;
  frameWidth: number;
  frameHeight: number;
}

export enum GenerationMode {
  FULL_SHEET = 'FULL_SHEET',
  INDIVIDUAL_FRAMES = 'INDIVIDUAL_FRAMES'
}
