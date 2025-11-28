'use client';

import { useRef, useState } from 'react';
import {
  Grid3x3,
  ImageIcon,
  Maximize2,
  Palette,
  RefreshCw,
  Settings2,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/lib/utils';
import type { GridMaker as GridMakerType } from '@/shared/types/blocks/landing';

import { GridPreview } from './grid-preview';
import { PAPER_FORMATS, PaperFormat } from './paper-formats';
import { GridSettings } from './types';

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

const defaultGridSettings: GridSettings = {
  rows: 6,
  columns: 4,
  lineColor: '#130b0b',
  lineOpacity: 0.5,
  lineWidth: 1,
  showLabels: true,
  gridType: 'custom',
  adjustImageToFit: false,
};

const sliderClass =
  'w-full h-2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-gray-300 [&::-webkit-slider-runnable-track]:rounded-lg [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-300 [&::-moz-range-track]:rounded-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer';

export function GridMaker({ gridMaker }: { gridMaker?: GridMakerType }) {
  const t = useTranslations('landing.grid_maker');

  const [gridSettings, setGridSettings] =
    useState<GridSettings>(defaultGridSettings);
  const [paperFormat, setPaperFormat] = useState<PaperFormat>(
    PAPER_FORMATS.find((item) => item.name === 'Letter') || PAPER_FORMATS[0]
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const paperIsCustom = paperFormat.name === 'Custom';

  const handleFile = (file: File) => {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t('helper.max_size'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageDataUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateGrid = (updates: Partial<GridSettings>) => {
    setGridSettings((prev) => ({ ...prev, ...updates }));
  };

  const handlePaperChange = (name: string) => {
    const format = PAPER_FORMATS.find((item) => item.name === name);
    if (format) setPaperFormat(format);
  };

  const sectionId = gridMaker?.id || 'grid-maker';

  return (
    <section
      id={sectionId}
      className="container mx-auto space-y-8 px-4 py-12 lg:py-16"
    >
      <div className="mx-auto max-w-5xl text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {gridMaker?.title || t('title')}
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          {gridMaker?.description || t('description')}
        </p>
      </div>

      <Card className="mx-auto max-w-6xl overflow-hidden border-border/50 bg-card/50 shadow-xl backdrop-blur-sm">
        <div className="grid h-full gap-0 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
          {/* Sidebar Controls */}
          <div className="border-b bg-muted/10 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleSelectFile}
                className="hidden"
              />
              <div className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t('helper.drag_tip')}</h3>
                </div>

                {!imageDataUrl ? (
                  <div
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5',
                      isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/25'
                    )}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    <div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-border transition-transform group-hover:scale-110">
                      <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {t('upload.title')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('upload.description')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <div className="relative aspect-video w-full border-b bg-muted/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageDataUrl}
                        alt="Preview"
                        className="h-full w-full object-contain p-2"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => inputRef.current?.click()}
                          className="pointer-events-auto"
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          {t('upload.replace')}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="text-xs font-medium text-muted-foreground">
                        Current Image
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => inputRef.current?.click()}
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          {t('upload.replace')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setImageDataUrl(null)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {imageDataUrl && (
                <div className="flex-1 overflow-y-auto">
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="grid-settings"
                    className="w-full"
                  >
                    <AccordionItem value="grid-settings" className="border-b-0">
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                          <span>{t('grid_settings.title')}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  {t('grid_settings.rows')}
                                </Label>
                                <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                                  {gridSettings.rows}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={2}
                                max={50}
                                value={gridSettings.rows}
                                className={sliderClass}
                                onChange={(e) =>
                                  updateGrid({ rows: Number(e.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  {t('grid_settings.columns')}
                                </Label>
                                <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                                  {gridSettings.columns}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={2}
                                max={50}
                                value={gridSettings.columns}
                                className={sliderClass}
                                onChange={(e) =>
                                  updateGrid({
                                    columns: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="appearance" className="border-b-0">
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span>Appearance</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <Label>{t('grid_settings.line_color')}</Label>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 w-6 rounded-full border shadow-sm"
                                style={{
                                  backgroundColor: gridSettings.lineColor,
                                }}
                              />
                              <input
                                type="color"
                                value={gridSettings.lineColor}
                                onChange={(e) =>
                                  updateGrid({ lineColor: e.target.value })
                                }
                                className="h-8 w-20 cursor-pointer rounded-md border bg-transparent px-1 py-0.5"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {t('grid_settings.line_opacity')}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(gridSettings.lineOpacity * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.1}
                              max={1}
                              step={0.1}
                              value={gridSettings.lineOpacity}
                              className={sliderClass}
                              onChange={(e) =>
                                updateGrid({
                                  lineOpacity: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {t('grid_settings.line_width')}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                {gridSettings.lineWidth}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={10}
                              step={0.5}
                              value={gridSettings.lineWidth}
                              className={sliderClass}
                              onChange={(e) =>
                                updateGrid({
                                  lineWidth: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="show-labels"
                              className="flex cursor-pointer flex-col"
                            >
                              <span>{t('grid_settings.show_labels')}</span>
                              <span className="font-normal text-xs text-muted-foreground">
                                Show numbering
                              </span>
                            </Label>
                            <Switch
                              id="show-labels"
                              checked={gridSettings.showLabels}
                              onCheckedChange={(checked) =>
                                updateGrid({ showLabels: checked })
                              }
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="paper" className="border-b-0">
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="h-4 w-4 text-muted-foreground" />
                          <span>{t('paper.title')}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="paper-format">
                              {t('paper.select_label')}
                            </Label>
                            <Select
                              value={paperFormat.name}
                              onValueChange={(value) =>
                                handlePaperChange(value)
                              }
                            >
                              <SelectTrigger id="paper-format">
                                <SelectValue
                                  placeholder={t('paper.select_label')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {PAPER_FORMATS.map((format) => (
                                  <SelectItem
                                    key={format.name}
                                    value={format.name}
                                  >
                                    {format.name}{' '}
                                    {format.name !== 'Custom'
                                      ? `(${format.width}×${format.height}${format.unit})`
                                      : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {paperIsCustom && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="custom-width">
                                  {t('paper.custom_width', {
                                    unit: paperFormat.unit,
                                  })}
                                </Label>
                                <Input
                                  id="custom-width"
                                  type="number"
                                  min={1}
                                  value={paperFormat.width || ''}
                                  onChange={(e) =>
                                    setPaperFormat((prev) => ({
                                      ...prev,
                                      width: Number(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="custom-height">
                                  {t('paper.custom_height', {
                                    unit: paperFormat.unit,
                                  })}
                                </Label>
                                <Input
                                  id="custom-height"
                                  type="number"
                                  min={1}
                                  value={paperFormat.height || ''}
                                  onChange={(e) =>
                                    setPaperFormat((prev) => ({
                                      ...prev,
                                      height: Number(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </div>

          {/* Main Preview Area */}
          <div className="relative flex min-h-[500px] flex-col bg-muted/20 p-4 lg:p-8">
            <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/10 bg-background/50 p-4 shadow-sm">
              <GridPreview
                image={imageDataUrl || ''}
                gridSettings={gridSettings}
                paperFormat={paperFormat}
                className="w-full max-w-full shadow-2xl"
              />
            </div>
            {!imageDataUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 opacity-20" />
                  <p>{t('helper.drag_tip')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
