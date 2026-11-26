import { useEffect, useRef } from 'react';
import { getLightModeSpec, LightSettings } from '../types/mindwave';

interface AmbientLightCanvasProps {
  settings: LightSettings;
  active: boolean;
  className?: string;
  scaleFactor?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function blendRgb(
  a: [number, number, number],
  b: [number, number, number],
  ratio: number
): [number, number, number] {
  const t = Math.max(0, Math.min(1, ratio));
  const inv = 1 - t;
  return [
    Math.round(a[0] * inv + b[0] * t),
    Math.round(a[1] * inv + b[1] * t),
    Math.round(a[2] * inv + b[2] * t),
  ];
}

function rgba(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, alpha)).toFixed(4)})`;
}

/**
 * Exact Canvas mathematical mirror of Android's AmbientLightCanvasView.kt.
 * Renders four-edge diffused illumination, traveling orbital perimeter waves,
 * and Silent Shiv Nada 4-beat breathing rings & sacred geometry.
 * Strictly visual-only (zero audio, zero haptics, zero rapid flashing).
 */
export function AmbientLightCanvas({
  settings,
  active,
  className = '',
  scaleFactor = 1,
}: AmbientLightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settingsRef = useRef(settings);
  const activeRef = useRef(active);

  settingsRef.current = settings;
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let phaseSeconds = 0;
    let lastTs = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(1, Math.floor(rect.width * dpr));
      const targetH = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const drawTriangle = (
      cx: number,
      cy: number,
      radius: number,
      rotationRad: number,
      strokeColor: string,
      lineWidth: number
    ) => {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = rotationRad - Math.PI / 2 + (i * 2 * Math.PI) / 3;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const renderFrame = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      if (activeRef.current && w > 0 && h > 0) {
        const dt = Math.min(0.064, Math.max(0, (now - lastTs) / 1000));
        const s = settingsRef.current;
        const speedMul = prefersReducedMotion ? 0.18 : Math.max(0.35, Math.min(1.35, s.speed));
        phaseSeconds = (phaseSeconds + dt * speedMul) % 3600;

        const mode = getLightModeSpec(s.mode);
        const nightDim = s.autoNightMode && s.simulateNightHours ? 0.58 : 1.0;
        const masterAlpha = Math.max(
          0.08,
          Math.min(0.86, s.intensity * s.transparency * nightDim * mode.attenuation)
        );

        const omega = (2 * Math.PI) / mode.baseCycleSeconds;

        // Smooth breathing curve (zero sudden spikes or strobing)
        let breath: number;
        if (mode.id === 'silent_shiv_nada') {
          const primary = 0.5 + 0.5 * Math.sin(phaseSeconds * omega);
          const fourBeat = 0.5 + 0.5 * Math.sin(phaseSeconds * omega * 4 - Math.PI / 2);
          breath = 0.6 + 0.28 * primary + 0.12 * fourBeat;
        } else if (mode.id === 'night_relax') {
          breath = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(phaseSeconds * omega * 0.8));
        } else {
          breath = 0.64 + 0.36 * (0.5 + 0.5 * Math.sin(phaseSeconds * omega));
        }

        const primaryRgb = hexToRgb(mode.primary);
        const customRgb = hexToRgb(s.customAccentColor);
        const secondaryRgb = s.useCustomColor
          ? blendRgb(hexToRgb(mode.secondary), customRgb, 0.65)
          : hexToRgb(mode.secondary);
        const accentRgb = s.useCustomColor ? customRgb : hexToRgb(mode.accent);
        const lunarRgb = hexToRgb(mode.lunar);

        const thickness = s.edgeThickness * scaleFactor * (0.85 + 0.3 * breath);
        const edgeAlpha = masterAlpha * breath;
        const drift = phaseSeconds * omega;
        const shiftA = 0.5 + 0.5 * Math.sin(drift);
        const shiftB = 0.5 + 0.5 * Math.cos(drift * 0.7);

        const topColor = blendRgb(secondaryRgb, accentRgb, shiftA);
        const bottomColor = blendRgb(primaryRgb, accentRgb, shiftB);
        const leftColor = blendRgb(secondaryRgb, lunarRgb, shiftB * 0.35);
        const rightColor = blendRgb(accentRgb, secondaryRgb, shiftA);

        // Top edge
        const topGrad = ctx.createLinearGradient(0, 0, 0, thickness);
        topGrad.addColorStop(0, rgba(lunarRgb, edgeAlpha * 0.6));
        topGrad.addColorStop(0.24, rgba(topColor, edgeAlpha * 0.88));
        topGrad.addColorStop(0.65, rgba(primaryRgb, edgeAlpha * 0.32));
        topGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, w, thickness);

        // Bottom edge
        const bottomGrad = ctx.createLinearGradient(0, h, 0, h - thickness);
        bottomGrad.addColorStop(0, rgba(lunarRgb, edgeAlpha * 0.52));
        bottomGrad.addColorStop(0.24, rgba(bottomColor, edgeAlpha * 0.85));
        bottomGrad.addColorStop(0.65, rgba(primaryRgb, edgeAlpha * 0.3));
        bottomGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, h - thickness, w, thickness);

        // Left edge
        const leftGrad = ctx.createLinearGradient(0, 0, thickness, 0);
        leftGrad.addColorStop(0, rgba(lunarRgb, edgeAlpha * 0.56));
        leftGrad.addColorStop(0.24, rgba(leftColor, edgeAlpha * 0.84));
        leftGrad.addColorStop(0.65, rgba(primaryRgb, edgeAlpha * 0.28));
        leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, thickness, h);

        // Right edge
        const rightGrad = ctx.createLinearGradient(w, 0, w - thickness, 0);
        rightGrad.addColorStop(0, rgba(lunarRgb, edgeAlpha * 0.56));
        rightGrad.addColorStop(0.24, rgba(rightColor, edgeAlpha * 0.84));
        rightGrad.addColorStop(0.65, rgba(primaryRgb, edgeAlpha * 0.28));
        rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rightGrad;
        ctx.fillRect(w - thickness, 0, thickness, h);

        // Orbiting perimeter highlights
        const orbRadius = thickness * 2.5;
        const orbAngle = drift * 0.65;
        const orbX = w * 0.5 + w * 0.48 * Math.cos(orbAngle);
        const orbY = h * 0.5 + h * 0.48 * Math.sin(orbAngle);

        const orb1 = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbRadius);
        orb1.addColorStop(0, rgba(lunarRgb, edgeAlpha * 0.52));
        orb1.addColorStop(0.45, rgba(accentRgb, edgeAlpha * 0.26));
        orb1.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orb1;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        const oppX = w - orbX;
        const oppY = h - orbY;
        const orb2 = ctx.createRadialGradient(oppX, oppY, 0, oppX, oppY, orbRadius);
        orb2.addColorStop(0, rgba(secondaryRgb, edgeAlpha * 0.46));
        orb2.addColorStop(0.45, rgba(primaryRgb, edgeAlpha * 0.22));
        orb2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orb2;
        ctx.beginPath();
        ctx.arc(oppX, oppY, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        // Central glow & sacred geometry meditation layer
        if (s.centralGlow > 0.02) {
          const cx = w * 0.5;
          const cy = mode.id === 'ajna_focus' ? h * 0.43 : h * 0.5;
          const minDim = Math.min(w, h);
          const haloRadius = minDim * (0.28 + 0.08 * breath);
          const centralAlpha = masterAlpha * s.centralGlow * breath;
          const veilAlpha = Math.min(0.36, centralAlpha * 0.42);

          const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloRadius);
          centerGrad.addColorStop(0, rgba(lunarRgb, veilAlpha * 0.9));
          centerGrad.addColorStop(0.34, rgba(accentRgb, veilAlpha * 0.5));
          centerGrad.addColorStop(0.7, rgba(secondaryRgb, veilAlpha * 0.2));
          centerGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = centerGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
          ctx.fill();

          if (mode.supportsSacredGeometry) {
            const geomAlpha = Math.min(0.45, centralAlpha * 0.52);

            // 4 concentric breathing waves (Silent Shiv Nada symbolic rhythm)
            for (let i = 0; i < 4; i++) {
              const progress = (phaseSeconds / mode.baseCycleSeconds + i * 0.25) % 1;
              const ringRadius = minDim * (0.06 + progress * 0.34);
              const fade = Math.sin(progress * Math.PI);
              ctx.beginPath();
              ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
              ctx.strokeStyle = rgba(i % 2 === 0 ? lunarRgb : accentRgb, geomAlpha * fade * 0.85);
              ctx.lineWidth = Math.max(0.75, 1.3 * scaleFactor * (1.2 - 0.5 * progress));
              ctx.stroke();
            }

            // Slow 8-petal harmonic mandala
            const petals = mode.id === 'silent_shiv_nada' ? 8 : 6;
            const mandalaRadius = minDim * (0.145 + 0.03 * breath);
            const slowRot = phaseSeconds * omega * 0.14;

            ctx.beginPath();
            for (let p = 0; p < petals; p++) {
              const a1 = slowRot + (p * 2 * Math.PI) / petals;
              const a2 = slowRot + ((p + 1) * 2 * Math.PI) / petals;
              const mid = (a1 + a2) * 0.5;
              const x1 = cx + mandalaRadius * 0.42 * Math.cos(a1);
              const y1 = cy + mandalaRadius * 0.42 * Math.sin(a1);
              const ctrlX = cx + mandalaRadius * 1.16 * Math.cos(mid);
              const ctrlY = cy + mandalaRadius * 1.16 * Math.sin(mid);
              const x2 = cx + mandalaRadius * 0.42 * Math.cos(a2);
              const y2 = cy + mandalaRadius * 0.42 * Math.sin(a2);
              ctx.moveTo(x1, y1);
              ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
            }
            ctx.strokeStyle = rgba(lunarRgb, geomAlpha * 0.62);
            ctx.lineWidth = Math.max(0.7, 1.0 * scaleFactor);
            ctx.stroke();

            // Intersecting sacred triangles
            drawTriangle(
              cx,
              cy,
              mandalaRadius * 0.72,
              slowRot,
              rgba(accentRgb, geomAlpha * 0.55),
              Math.max(0.7, 0.95 * scaleFactor)
            );
            drawTriangle(
              cx,
              cy,
              mandalaRadius * 0.72,
              -slowRot + Math.PI / 3,
              rgba(lunarRgb, geomAlpha * 0.5),
              Math.max(0.7, 0.95 * scaleFactor)
            );
          }
        }
      }

      lastTs = now;
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [scaleFactor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}
