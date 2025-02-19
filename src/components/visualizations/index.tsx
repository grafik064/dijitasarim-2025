import React from 'react';
import { Line, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CircularGaugeProps {
  value: number;
  label: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  colorScale?: Array<{
    value: number;
    color: string;
  }>;
}

export function CircularGauge({
  value,
  label,
  description,
  size = 'medium',
  colorScale = [
    { value: 1, color: '#22c55e' }
  ]
}: CircularGaugeProps) {
  const radius = size === 'small' ? 40 : size === 'medium' ? 60 : 80;
  const strokeWidth = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
  const fontSize = size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-4xl';

  const circumference = 2 * Math.PI * radius;
  const progress = value * circumference;
  const color = getColorFromScale(value, colorScale);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        className="transform -rotate-90"
        width={radius * 2 + strokeWidth}
        height={radius * 2 + strokeWidth}
      >
        {/* Arka plan halkası */}
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* İlerleme halkası */}
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', fontSize)}>
          {Math.round(value * 100)}%
        </span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600 text-center">{description}</p>
      )}
    </div>
  );
}

interface ColorPaletteProps {
  colors: string[];
  harmony: number;
}

export function ColorPalette({ colors, harmony }: ColorPaletteProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Renk Uyumu</span>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Circle
              key={index}
              className={cn(
                'w-4 h-4',
                index < Math.round(harmony * 5)
                  ? 'fill-primary stroke-primary'
                  : 'fill-gray-200 stroke-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  height?: number;
}

export function LineChart({ data, height = 200 }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: ((maxValue - d.value) / maxValue) * height
  }));

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="w-full relative" style={{ height }}>
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
      >
        {/* Y ekseni */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={height}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {/* X ekseni */}
        <line
          x1="0"
          y1={height}
          x2="100%"
          y2={height}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {/* Veri çizgisi */}
        <path
          d={pathData}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          className="transition-all duration-500 ease-out"
        />
        {/* Veri noktaları */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#60a5fa"
            className="transition-all duration-500 ease-out"
          />
        ))}
      </svg>
      {/* Etiketler */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-gray-500">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;

  return (
    <div className="w-full relative" style={{ height }}>
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
      >
        {/* Y ekseni */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={height}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {/* X ekseni */}
        <line
          x1="0"
          y1={height}
          x2="100%"
          y2={height}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {/* Çubuklar */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * height;
          return (
            <rect
              key={i}
              x={`${i * barWidth}%`}
              y={height - barHeight}
              width={`${barWidth * 0.8}%`}
              height={barHeight}
              fill={d.color || '#60a5fa'}
              rx="4"
              className="transition-all duration-500 ease-out"
            />
          );
        })}
      </svg>
      {/* Etiketler */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-gray-500">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface RadarChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  size?: number;
}

export function RadarChart({ data, size = 200 }: RadarChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  const angleStep = (2 * Math.PI) / data.length;

  const points = data.map((d, i) => ({
    x: centerX + radius * Math.cos(i * angleStep - Math.PI / 2) * d.value,
    y: centerY + radius * Math.sin(i * angleStep - Math.PI / 2) * d.value,
    label: d.label
  }));

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + 'Z';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Izgara çizgileri */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
          <polygon
            key={i}
            points={data
              .map((_, j) => {
                const x = centerX + radius * r * Math.cos(j * angleStep - Math.PI / 2);
                const y = centerY + radius * r * Math.sin(j * angleStep - Math.PI / 2);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {/* Eksen çizgileri */}
        {data.map((_, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={centerX + radius * Math.cos(i * angleStep - Math.PI / 2)}
            y2={centerY + radius * Math.sin(i * angleStep - Math.PI / 2)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {/* Veri alanı */}
        <path
          d={pathData}
          fill="#60a5fa33"
          stroke="#60a5fa"
          strokeWidth="2"
          className="transition-all duration-500 ease-out"
        />
        {/* Veri noktaları */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#60a5fa"
            className="transition-all duration-500 ease-out"
          />
        ))}
      </svg>
      {/* Etiketler */}
      {points.map((p, i) => (
        <span
          key={i}
          className="absolute text-xs text-gray-500"
          style={{
            left: `${(p.x / size) * 100}%`,
            top: `${(p.y / size) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}

// Yardımcı fonksiyonlar
function getColorFromScale(value: number, scale: Array<{ value: number; color: string }>) {
  const sortedScale = [...scale].sort((a, b) => a.value - b.value);
  const color = sortedScale.find(s => value <= s.value)?.color;
  return color || sortedScale[sortedScale.length - 1].color;
}

export { CircularGauge, ColorPalette, LineChart, BarChart, RadarChart };