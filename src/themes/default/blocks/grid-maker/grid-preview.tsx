'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';

import { PaperFormat } from './paper-formats';
import { GridSettings } from './types';

interface GridPreviewProps {
  image: string;
  gridSettings: GridSettings;
  paperFormat: PaperFormat;
  className?: string;
}

const MAX_CANVAS_WIDTH = 1600;

export function GridPreview({
  image,
  gridSettings,
  paperFormat,
  className,
}: GridPreviewProps) {
  const t = useTranslations('landing.grid_maker');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !image) {
      setDownloadUrl('');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();

    setIsRendering(true);

    img.onload = () => {
      let canvasWidth = Math.min(img.width, MAX_CANVAS_WIDTH);
      if (canvasWidth < 1) canvasWidth = 800;

      let canvasHeight = Math.round((img.height / img.width) * canvasWidth);

      if (gridSettings.gridType === 'square' && gridSettings.adjustImageToFit) {
        const aspect = gridSettings.columns / gridSettings.rows;
        if (aspect > 0) {
          canvasHeight = Math.round(canvasWidth / aspect);
        }
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (isGrayscale) {
        applyGrayscale(ctx, canvas.width, canvas.height);
      }

      drawGrid(ctx, canvas.width, canvas.height, gridSettings);

      setDownloadUrl(canvas.toDataURL('image/png'));
      setIsRendering(false);
    };

    img.src = image;
  }, [image, gridSettings, isGrayscale]);

  const printingGuide = useMemo(() => {
    const verticalCount = Math.max(gridSettings.columns - 1, 0);
    const horizontalCount = Math.max(gridSettings.rows - 1, 0);

    const verticalInterval = gridSettings.columns
      ? (paperFormat.width / gridSettings.columns).toFixed(1)
      : '0';
    const horizontalInterval = gridSettings.rows
      ? (paperFormat.height / gridSettings.rows).toFixed(1)
      : '0';

    const lastLabel = `${String.fromCharCode(
      64 + gridSettings.rows
    )}${gridSettings.columns}`;

    return {
      verticalCount,
      horizontalCount,
      verticalInterval,
      horizontalInterval,
      lastLabel,
    };
  }, [gridSettings, paperFormat]);

  const handleDownload = () => {
    if (!downloadUrl) return;

    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = 'grid-image.png';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-col gap-4">
        <div>
          <CardTitle>{t('preview.title')}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {isRendering
              ? t('preview.rendering')
              : t('description')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsGrayscale((prev) => !prev)}
          >
            {isGrayscale
              ? t('preview.revert_color')
              : t('preview.convert_bw')}
          </Button>
          <Button
            size="default"
            onClick={handleDownload}
            disabled={!downloadUrl || isRendering}
          >
            {isRendering ? t('preview.rendering') : t('preview.download')}
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="bg-muted/30 relative flex min-h-[400px] items-center justify-center rounded-xl p-3 shadow-inner">
          <div className="w-full overflow-hidden rounded-lg border bg-background">
            <canvas
              ref={canvasRef}
              className="max-h-[600px] w-full object-contain"
              aria-label="Grid preview"
            />
          </div>
          {!downloadUrl && (
            <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
              {t('preview.empty_hint')}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <h3 className="text-base font-semibold">{t('printing.title')}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('printing.format_line', {
              name: paperFormat.name,
              width: paperFormat.width,
              height: paperFormat.height,
              unit: paperFormat.unit,
            })}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              •{' '}
              {t('printing.vertical', {
                count: printingGuide.verticalCount,
                interval: printingGuide.verticalInterval,
                unit: paperFormat.unit,
              })}
            </li>
            <li>
              •{' '}
              {t('printing.horizontal', {
                count: printingGuide.horizontalCount,
                interval: printingGuide.horizontalInterval,
                unit: paperFormat.unit,
              })}
            </li>
            {gridSettings.showLabels && (
              <li>
                •{' '}
                {t('printing.labels', { lastLabel: printingGuide.lastLabel })}
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: GridSettings
) {
  const { rows, columns, lineColor, lineOpacity, lineWidth, showLabels } =
    settings;

  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.globalAlpha = lineOpacity;
  ctx.lineWidth = lineWidth;

  const columnWidth = width / columns;
  for (let i = 1; i < columns; i++) {
    const x = i * columnWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const rowHeight = height / rows;
  for (let i = 1; i < rows; i++) {
    const y = i * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (showLabels) {
    drawLabels(ctx, width, height, rows, columns, lineColor);
  }

  ctx.restore();
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rows: number,
  columns: number,
  color: string
) {
  const columnWidth = width / columns;
  const rowHeight = height / rows;

  ctx.save();
  ctx.font = '14px Arial';
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * columnWidth + 6;
      const y = (row + 1) * rowHeight - 6;
      const rowLabel = String.fromCharCode(65 + row);
      const colLabel = col + 1;
      ctx.fillText(`${rowLabel}${colLabel}`, x, y);
    }
  }

  ctx.restore();
}

function applyGrayscale(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }

  ctx.putImageData(imageData, 0, 0);
}
