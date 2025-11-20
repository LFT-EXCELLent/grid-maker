'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  BEAUTY_PROMPT_CONFIG,
  BeautyPromptOption,
} from '@/config/ai/beauty-prompts';
import {
  getDefaultPortraitModel,
  getPortraitModelConfig,
  PORTRAIT_MODEL_CONFIGS,
} from '@/config/ai/models';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import {
  ImageUploader,
  ImageUploaderValue,
  LazyImage,
} from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Toggle } from '@/shared/components/ui/toggle';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import type { PortraitRetouchEditor as PortraitRetouchEditorType } from '@/shared/types/blocks/landing';

type BeautyGroup = {
  key: string;
  label: string;
  options: (BeautyPromptOption & { label: string; groupKey: string })[];
};

type GeneratedImage = {
  id: string;
  url: string;
};

const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGES = 4;
const MIN_REQUIRED_IMAGES = 1;
const MAX_UPLOAD_SIZE_MB = 15;
const POLL_INTERVAL = 4000;
const COST_CREDITS = 4;

const parseJson = (value: any) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractUrls = (payload: any): string[] => {
  if (!payload) return [];

  const output = payload.output ?? payload.images ?? payload.data ?? payload;

  if (!output) return [];

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') {
          const candidate =
            item.imageUrl ?? item.url ?? item.uri ?? item.image ?? item.src;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.imageUrl ?? output.url ?? output.uri ?? output.image ?? output.src;
    return typeof candidate === 'string' ? [candidate] : [];
  }

  return [];
};

export function PortraitRetouchEditor({
  portraitRetouch,
  className,
}: {
  portraitRetouch?: PortraitRetouchEditorType;
  className?: string;
}) {
  const t = useTranslations('landing.portrait_retouch_editor');
  const { user, setIsShowSignModal, fetchUserCredits } = useAppContext();

  const [uploadItems, setUploadItems] = useState<ImageUploaderValue[]>([]);
  const [selectedBeauty, setSelectedBeauty] = useState<
    Record<string, Set<string>>
  >({});
  const [otherPrompt, setOtherPrompt] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(
    getDefaultPortraitModel()?.id || PORTRAIT_MODEL_CONFIGS[0]?.id
  );
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const selectedModel = useMemo(
    () => getPortraitModelConfig(selectedModelId) || getDefaultPortraitModel(),
    [selectedModelId]
  );

  const beautyGroups = useMemo(() => {
    const raw = t.raw('beauty.groups') as Record<
      string,
      { label?: string; options?: { label?: string }[] }
    >;

    const getOptions = (key: string) => {
      const labels = raw?.[key]?.options || [];
      const prompts = BEAUTY_PROMPT_CONFIG[key] || [];
      return prompts.map((option, idx) => ({
        ...option,
        groupKey: key,
        label: labels[idx]?.label || option.id,
      }));
    };

    const facialCombined = [
      ...getOptions('eyes'),
      ...getOptions('nose'),
      ...getOptions('mouth_teeth'),
    ];

    const orderedKeys: Array<{
      labelKey: string;
      labelOverride?: string;
      options: (BeautyPromptOption & { label: string; groupKey: string })[];
    }> = [
      { labelKey: 'general', options: getOptions('general') },
      { labelKey: 'face_shape', options: getOptions('face_shape') },
      { labelKey: 'skin', options: getOptions('skin') },
      { labelKey: 'eyes', options: facialCombined },
      { labelKey: 'hair', options: getOptions('hair') },
      {
        labelKey: 'artifacts_removal',
        options: getOptions('artifacts_removal'),
      },
    ];

    return orderedKeys
      .filter((item) => item.options.length)
      .map((item) => ({
        key: item.labelKey,
        label:
          item.labelOverride || raw?.[item.labelKey]?.label || item.labelKey,
        options: item.options,
      }));
  }, [t]);

  const uploadedUrls = useMemo(
    () =>
      uploadItems
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string),
    [uploadItems]
  );

  const hasBeautySelection = useMemo(
    () => Object.values(selectedBeauty).some((set) => set.size > 0),
    [selectedBeauty]
  );

  const trimmedOtherPrompt = otherPrompt.trim();

  const canGenerate =
    uploadedUrls.length >= MIN_REQUIRED_IMAGES &&
    (hasBeautySelection || trimmedOtherPrompt.length > 0) &&
    !!selectedModel &&
    !isGenerating;

  const currentImage = useMemo(() => {
    if (!generatedImages.length) return null;
    if (activeImageId) {
      return (
        generatedImages.find((item) => item.id === activeImageId) ||
        generatedImages[0]
      );
    }
    return generatedImages[0];
  }, [activeImageId, generatedImages]);

  useEffect(() => {
    if (!generatedImages.length) {
      setActiveImageId(null);
      return;
    }
    if (activeImageId) {
      const stillExists = generatedImages.some(
        (item) => item.id === activeImageId
      );
      if (!stillExists) {
        setActiveImageId(generatedImages[0].id);
      }
    } else {
      setActiveImageId(generatedImages[0].id);
    }
  }, [generatedImages, activeImageId]);

  const statusLabel = useMemo(() => {
    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return t('status.pending');
      case AITaskStatus.PROCESSING:
        return t('status.processing');
      case AITaskStatus.SUCCESS:
        return t('status.success');
      case AITaskStatus.FAILED:
        return t('status.failed');
      default:
        return '';
    }
  }, [taskStatus, t]);

  const buildPromptPayload = useCallback(() => {
    const payload: Record<string, string[]> = {};

    Object.entries(selectedBeauty).forEach(([key, set]) => {
      if (set.size > 0) {
        payload[key] = Array.from(set);
      }
    });

    if (trimmedOtherPrompt) {
      payload.other_prompt = [trimmedOtherPrompt];
    }

    return JSON.stringify(payload);
  }, [selectedBeauty, trimmedOtherPrompt]);

  const toggleBeauty = (groupKey: string, prompt: string) => {
    setSelectedBeauty((prev) => {
      const current = new Set(prev[groupKey] || []);
      if (current.has(prompt)) {
        current.delete(prompt);
      } else {
        current.add(prompt);
      }
      return { ...prev, [groupKey]: current };
    });
  };

  const parseTaskImages = (
    taskInfo: any,
    taskResult: any
  ): GeneratedImage[] => {
    const infoObj = parseJson(taskInfo);
    const resultObj = parseJson(taskResult);

    const infoUrls = extractUrls(infoObj?.images || infoObj);
    const resultUrls = extractUrls(
      resultObj?.output || resultObj?.images || resultObj
    );
    const urls = infoUrls.length ? infoUrls : resultUrls;

    return urls.map((url: string, idx: number) => ({
      id: `${Date.now()}-${idx}-${url}`,
      url,
    }));
  };

  const pollTaskStatus = useCallback(async (currentTaskId: string) => {
    try {
      const resp = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: currentTaskId }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to query task');
      }

      const status = data?.status as AITaskStatus | undefined;
      if (status) {
        setTaskStatus(status);
      }

      if (
        status === AITaskStatus.SUCCESS ||
        status === AITaskStatus.FAILED ||
        status === AITaskStatus.CANCELED
      ) {
        setIsGenerating(false);
        const images = parseTaskImages(data?.taskInfo, data?.taskResult);
        if (status === AITaskStatus.SUCCESS && images.length) {
          setGeneratedImages(images);
        } else {
          setGeneratedImages([]);
          setActiveImageId(null);
        }
        return true;
      }
    } catch (error: any) {
      console.error('Failed to poll task status:', error);
      toast.error(error.message || 'Failed to query task');
      setIsGenerating(false);
      setGeneratedImages([]);
      setActiveImageId(null);
      setTaskStatus(AITaskStatus.FAILED);
    }
    return false;
  }, []);

  useEffect(() => {
    if (!taskId || !isGenerating) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        cancelled = true;
      }
    };

    tick();

    const interval = setInterval(() => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      pollTaskStatus(taskId);
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (!selectedModel) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (uploadedUrls.length < MIN_REQUIRED_IMAGES) {
      toast.error(t('helper.requirement'));
      return;
    }

    if (!hasBeautySelection && !trimmedOtherPrompt) {
      toast.error(t('helper.requirement'));
      return;
    }

    const remainingCredits = user?.credits?.remainingCredits ?? 0;
    if (remainingCredits < COST_CREDITS) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const promptPayload = buildPromptPayload();
    // Reset task id before a new generation to avoid polling stale tasks
    setTaskId(null);
    setIsGenerating(true);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setActiveImageId(null);

    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: 'image-to-image',
          provider: selectedModel.provider,
          model: selectedModel.id,
          prompt: promptPayload,
          options: {
            image_input: uploadedUrls,
          },
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create an image task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      setTaskId(newTaskId);
      fetchUserCredits?.();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(error.message || 'Failed to generate image');
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    try {
      setDownloading(true);
      const resp = await fetch(currentImage.url);
      if (!resp.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${currentImage.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Image downloaded');
    } catch (error: any) {
      console.error('Failed to download image:', error);
      toast.error(error?.message || 'Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section
      id={portraitRetouch?.id}
      className={cn('py-12 md:py-16', portraitRetouch?.className, className)}
    >
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {portraitRetouch?.title || t('title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label className="text-sm font-medium">
                    {t('upload.label')}
                  </Label>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    <span>
                      {t('upload.selected', {
                        count: uploadedUrls.length,
                        max: MAX_IMAGES,
                      })}
                    </span>
                  </div>
                </div>
                <ImageUploader
                  allowMultiple
                  maxImages={MAX_IMAGES}
                  maxSizeMB={MAX_UPLOAD_SIZE_MB}
                  className="mb-2"
                  onChange={setUploadItems}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('beauty.title')}
                </Label>
                <div className="space-y-3 rounded-lg border border-dashed p-3">
                  {beautyGroups.map((group) => (
                    <div key={group.key} className="space-y-2">
                      <p className="text-muted-foreground text-xs tracking-wide uppercase">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option, idx) => {
                          const key = option.groupKey;
                          const isSelected =
                            selectedBeauty[key]?.has(option.prompt) ?? false;
                          return (
                            <Toggle
                              key={`${group.key}-${idx}`}
                              size="sm"
                              variant="outline"
                              pressed={isSelected}
                              onPressedChange={() =>
                                toggleBeauty(key, option.prompt)
                              }
                              className={cn(
                                'rounded-md border px-3 py-2 text-xs font-medium',
                                'data-[state=on]:border-black data-[state=on]:bg-black data-[state=on]:text-white',
                                'data-[state=on]:hover:bg-black/90 data-[state=on]:hover:text-white',
                                'dark:data-[state=on]:border-white dark:data-[state=on]:bg-white dark:data-[state=on]:text-black',
                                'dark:data-[state=on]:hover:bg-white/90 dark:data-[state=on]:hover:text-black'
                              )}
                            >
                              {option.label}
                            </Toggle>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('other_prompt_label')}
                </Label>
                <div className="relative">
                  <Textarea
                    value={otherPrompt}
                    placeholder={t('other_prompt_placeholder')}
                    className="min-h-[120px] pr-12"
                    onChange={(event) =>
                      setOtherPrompt(
                        event.target.value.slice(0, MAX_PROMPT_LENGTH)
                      )
                    }
                  />
                  <div className="text-muted-foreground pointer-events-none absolute right-3 bottom-2 text-xs">
                    {t('counter_format', { count: otherPrompt.length })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-2 sm:w-56">
                  <Label className="text-sm font-medium">
                    {t('model.label')}
                  </Label>
                  <Select
                    value={selectedModelId}
                    onValueChange={(value) => setSelectedModelId(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('model.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PORTRAIT_MODEL_CONFIGS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {t(`model.options.${model.id}`, {
                            defaultMessage: model.label,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full text-base sm:flex-1"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  {isGenerating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('buttons.generate')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {portraitRetouch?.tip || t('result_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted aspect-[4/5] w-full overflow-hidden rounded-xl border">
                {currentImage ? (
                  <LazyImage
                    src={currentImage.url}
                    alt="Generated portrait"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center gap-2 text-sm">
                    <ImageIcon className="h-5 w-5" />
                    <span>{t('helper.requirement')}</span>
                  </div>
                )}
              </div>

              {generatedImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {generatedImages.map((item) => {
                    const isActive = item.id === currentImage?.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveImageId(item.id)}
                        className={cn(
                          'overflow-hidden rounded-lg border',
                          isActive
                            ? 'border-foreground ring-foreground ring-1'
                            : ''
                        )}
                      >
                        <img
                          src={item.url}
                          alt="thumbnail"
                          className="h-16 w-16 object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t('buttons.regenerate')}
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleDownload}
                  disabled={!currentImage || downloading}
                >
                  {downloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {t('buttons.download')}
                </Button>
              </div>

              {statusLabel && (
                <p className="text-muted-foreground text-xs">{statusLabel}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
