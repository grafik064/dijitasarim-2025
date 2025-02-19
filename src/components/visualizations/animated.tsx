import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularGauge, ColorPalette, LineChart, BarChart, RadarChart } from './';

interface AnimatedProps {
  initial?: boolean;
  animate?: boolean;
  duration?: number;
}

export function AnimatedCircularGauge({
  value,
  label,
  description,
  size,
  colorScale,
  initial = true,
  animate = true,
  duration = 0.5
}: AnimatedProps & Parameters<typeof CircularGauge>[0]) {
  const [currentValue, setCurrentValue] = useState(initial ? 0 : value);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setCurrentValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, animate]);

  return (
    <motion.div
      initial={{ scale: initial ? 0.8 : 1, opacity: initial ? 0 : 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration }}
    >
      <CircularGauge
        value={currentValue}
        label={label}
        description={description}
        size={size}
        colorScale={colorScale}
      />
    </motion.div>
  );
}

export function AnimatedColorPalette({
  colors,
  harmony,
  initial = true,
  animate = true,
  duration = 0.5
}: AnimatedProps & Parameters<typeof ColorPalette>[0]) {
  return (
    <motion.div
      initial={{ y: initial ? 20 : 0, opacity: initial ? 0 : 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration, delay: initial ? 0.2 : 0 }}
    >
      <ColorPalette colors={colors} harmony={harmony} />
    </motion.div>
  );
}

export function AnimatedLineChart({
  data,
  height,
  initial = true,
  animate = true,
  duration = 0.5
}: AnimatedProps & Parameters<typeof LineChart>[0]) {
  const [currentData, setCurrentData] = useState(
    initial ? data.map(d => ({ ...d, value: 0 })) : data
  );

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setCurrentData(data);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, animate]);

  return (
    <motion.div
      initial={{ x: initial ? -20 : 0, opacity: initial ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration }}
    >
      <LineChart data={currentData} height={height} />
    </motion.div>
  );
}

export function AnimatedBarChart({
  data,
  height,
  initial = true,
  animate = true,
  duration = 0.5
}: AnimatedProps & Parameters<typeof BarChart>[0]) {
  const [currentData, setCurrentData] = useState(
    initial ? data.map(d => ({ ...d, value: 0 })) : data
  );

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setCurrentData(data);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, animate]);

  return (
    <motion.div
      initial={{ y: initial ? 20 : 0, opacity: initial ? 0 : 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration }}
    >
      <BarChart data={currentData} height={height} />
    </motion.div>
  );
}

export function AnimatedRadarChart({
  data,
  size,
  initial = true,
  animate = true,
  duration = 0.5
}: AnimatedProps & Parameters<typeof RadarChart>[0]) {
  const [currentData, setCurrentData] = useState(
    initial ? data.map(d => ({ ...d, value: 0 })) : data
  );

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setCurrentData(data);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, animate]);

  return (
    <motion.div
      initial={{ scale: initial ? 0.8 : 1, opacity: initial ? 0 : 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration }}
    >
      <RadarChart data={currentData} size={size} />
    </motion.div>
  );
}

// İnteraktif bileşenler
export function InteractiveBarChart({
  data,
  height,
  onBarClick,
  highlightedIndex
}: Parameters<typeof BarChart>[0] & {
  onBarClick?: (index: number) => void;
  highlightedIndex?: number;
}) {
  return (
    <div className="relative">
      <BarChart
        data={data.map((d, i) => ({
          ...d,
          color: i === highlightedIndex ? '#3b82f6' : '#60a5fa'
        }))}
        height={height}
      />
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${data.length}, 1fr)`
        }}
      >
        {data.map((_, i) => (
          <motion.div
            key={i}
            className="cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => onBarClick?.(i)}
          />
        ))}
      </div>
    </div>
  );
}

export function InteractiveRadarChart({
  data,
  size,
  onPointClick,
  highlightedIndex
}: Parameters<typeof RadarChart>[0] & {
  onPointClick?: (index: number) => void;
  highlightedIndex?: number;
}) {
  return (
    <div className="relative">
      <RadarChart data={data} size={size} />
      <div className="absolute inset-0">
        {data.map((_, i) => {
          const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
          const radius = size * 0.4;
          const x = size / 2 + radius * Math.cos(angle);
          const y = size / 2 + radius * Math.sin(angle);

          return (
            <motion.div
              key={i}
              className="absolute w-6 h-6 -ml-3 -mt-3 cursor-pointer"
              style={{ left: x, top: y }}
              whileHover={{ scale: 1.2 }}
              onClick={() => onPointClick?.(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Animasyon yardımcıları
export function useAnimatedValue(
  targetValue: number,
  duration = 500,
  delay = 0
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay;
    const startValue = value;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      
      if (elapsed >= duration) {
        setValue(targetValue);
        return;
      }
      
      const progress = elapsed / duration;
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + (targetValue - startValue) * easedProgress;
      
      setValue(currentValue);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, delay]);

  return value;
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export {
  AnimatedCircularGauge,
  AnimatedColorPalette,
  AnimatedLineChart,
  AnimatedBarChart,
  AnimatedRadarChart,
  InteractiveBarChart,
  InteractiveRadarChart
};