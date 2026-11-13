import { useEffect, useRef } from 'react';

function makeFlake(width, height, wind) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.8 + 0.45,
    opacity: Math.random() * 0.48 + 0.2,
    speed: Math.random() * 0.42 + 0.16,
    sway: Math.random() * 0.32 + 0.08,
    phase: Math.random() * Math.PI * 2,
    wind,
  };
}

export default function Snowfall({ snowfall = 0, precipitation = 0, windSpeed = 0, windDirection = 0, weatherCode = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const snowCodes = [71, 73, 75, 77, 85, 86];
    const fallingSnow = snowfall > 0 || snowCodes.includes(weatherCode);
    const count = Math.max(26, Math.min(190, Math.round(
      30 + snowfall * 25 + precipitation * 3.5 + (fallingSnow ? 65 : 0) + windSpeed * 0.35,
    )));
    // Meteorological direction describes where wind comes from, so flakes drift the opposite way.
    const windRadians = ((windDirection + 180) * Math.PI) / 180;
    const windDrift = Math.sin(windRadians) * Math.min(1.7, windSpeed / 24);
    let width = 0;
    let height = 0;
    let flakes = [];
    let animationId = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      flakes = Array.from({ length: count }, () => makeFlake(width, height, windDrift));
      draw(true);
    };

    const draw = (staticFrame = false) => {
      context.clearRect(0, 0, width, height);
      for (const flake of flakes) {
        context.beginPath();
        context.fillStyle = `rgba(230, 241, 250, ${flake.opacity})`;
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fill();

        if (!staticFrame && !reducedMotion) {
          flake.phase += 0.012;
          flake.x += flake.wind * 0.75 + Math.sin(flake.phase) * flake.sway;
          flake.y += flake.speed;
          if (flake.y > height + 5) {
            flake.y = -6;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + 8) flake.x = -8;
          if (flake.x < -8) flake.x = width + 8;
        }
      }
    };

    const animate = () => {
      draw(false);
      animationId = window.requestAnimationFrame(animate);
    };

    resize();
    if (!reducedMotion) animationId = window.requestAnimationFrame(animate);
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      context.clearRect(0, 0, width, height);
    };
  }, [snowfall, precipitation, windSpeed, windDirection, weatherCode]);

  return <canvas ref={canvasRef} className="snowfall" aria-hidden="true" />;
}
