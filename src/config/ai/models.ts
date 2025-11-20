export type PortraitModelConfig = {
  id: string;
  label: string;
  provider: string;
  default?: boolean;
  supportsImageToImage?: boolean;
  supportsMultipleOutputs?: boolean;
  defaultMaxImages?: number;
  options?: Record<string, unknown>;
};

export const PORTRAIT_MODEL_CONFIGS: PortraitModelConfig[] = [
  {
    id: 'google/nano-banana',
    label: 'Nano Banana AI',
    provider: 'replicate',
    default: true,
    supportsImageToImage: true,
    supportsMultipleOutputs: false,
  },
  {
    id: 'bytedance/seedream-4',
    label: 'Seedream 4.0',
    provider: 'replicate',
    supportsImageToImage: true,
    supportsMultipleOutputs: true,
    defaultMaxImages: 4,
  },
];

export const getPortraitModelConfig = (id?: string) =>
  PORTRAIT_MODEL_CONFIGS.find((item) => item.id === id);

export const getDefaultPortraitModel = () =>
  PORTRAIT_MODEL_CONFIGS.find((item) => item.default) ||
  PORTRAIT_MODEL_CONFIGS[0];
