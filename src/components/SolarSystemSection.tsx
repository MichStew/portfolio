import { useEffect, useRef, useState } from 'react';

type SolarSystemSectionProps = {
  question: string;
  reducedMotion: boolean;
};

type Planet = {
  orbit: number;
  size: number;
  period: number;
  phase: number;
  alpha: number;
};

const ORBIT_Y_SCALE = 0.7;
const PLANETS: Planet[] = [
  { orbit: 0.12, size: 2.1, period: 24, phase: 0.25, alpha: 0.82 },
  { orbit: 0.19, size: 2.6, period: 36, phase: 1.2, alpha: 0.86 },
  { orbit: 0.27, size: 2.8, period: 52, phase: 2.1, alpha: 0.94 },
  { orbit: 0.35, size: 2.4, period: 72, phase: 0.7, alpha: 0.78 },
  { orbit: 0.5, size: 4.4, period: 120, phase: 2.8, alpha: 0.72 },
  { orbit: 0.64, size: 4.1, period: 170, phase: 1.65, alpha: 0.68 },
  { orbit: 0.79, size: 3.4, period: 220, phase: 0.95, alpha: 0.62 },
  { orbit: 0.91, size: 3.2, period: 280, phase: 2.45, alpha: 0.58 },
];

function renderQuestion(question: string) {
  const matches = Array.from(question.matchAll(/you/gi));
  const match = matches[1];

  if (!match || match.index === undefined) {
    return question;
  }

  const start = match.index;
  const end = start + match[0].length;

  return (
    <>
      {question.slice(0, start)}
      <span className="solar-end__question-accent">{question.slice(start, end)}</span>
      {question.slice(end)}
    </>
  );
}

export default function SolarSystemSection({
  question,
  reducedMotion,
}: SolarSystemSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const dprRef = useRef(1);
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  );

  const drawScene = (elapsedMs: number) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const { width, height } = canvas;
    const logicalWidth = canvas.clientWidth || width / dprRef.current;
    const logicalHeight = canvas.clientHeight || height / dprRef.current;
    const centerX = logicalWidth / 2;
    const centerY = logicalHeight * 0.54;
    const maxOrbitRadius = Math.min(logicalWidth * 0.48, logicalHeight * 0.66);
    const seconds = elapsedMs / 1000;

    context.clearRect(0, 0, logicalWidth, logicalHeight);
    context.save();
    context.translate(centerX, centerY);

    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255, 255, 255, 0.12)';

    PLANETS.forEach((planet) => {
      const orbitRadius = maxOrbitRadius * planet.orbit;

      context.beginPath();
      context.ellipse(0, 0, orbitRadius, orbitRadius * ORBIT_Y_SCALE, 0, 0, Math.PI * 2);
      context.stroke();
    });

    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.beginPath();
    context.moveTo(-maxOrbitRadius * 1.04, 0);
    context.lineTo(maxOrbitRadius * 1.04, 0);
    context.stroke();

    context.fillStyle = 'rgba(255, 255, 255, 0.94)';
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();

    PLANETS.forEach((planet, index) => {
      const orbitRadius = maxOrbitRadius * planet.orbit;
      const angle = planet.phase + (seconds / planet.period) * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius * ORBIT_Y_SCALE;

      context.fillStyle = `rgba(255, 255, 255, ${planet.alpha})`;
      context.beginPath();
      context.arc(x, y, planet.size, 0, Math.PI * 2);
      context.fill();

      if (index === 5) {
        context.strokeStyle = 'rgba(255, 255, 255, 0.26)';
        context.lineWidth = 1;
        context.beginPath();
        context.ellipse(x, y, planet.size * 2.2, planet.size * 0.9, 0, 0, Math.PI * 2);
        context.stroke();
      }
    });

    context.restore();
  };

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.22,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const resizeCanvas = () => {
      const parent = canvas.parentElement;

      if (!parent) {
        return;
      }

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');

      if (context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(dpr, dpr);
      }

      drawScene(elapsedRef.current);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(canvas.parentElement ?? canvas);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const shouldAnimate = !reducedMotion && isInView && isDocumentVisible;

    if (!shouldAnimate) {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      drawScene(elapsedRef.current);
      return;
    }

    const startTime = performance.now() - elapsedRef.current;

    const tick = (now: number) => {
      elapsedRef.current = now - startTime;
      drawScene(elapsedRef.current);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isDocumentVisible, isInView, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="solar-end"
      aria-labelledby="solar-end-title"
    >
      <div className="solar-end__inner">
        <div className="solar-end__copy" data-reveal>
          <p className="solar-end__label">A Small Question</p>
          <h2 id="solar-end-title" className="solar-end__question">
            {renderQuestion(question)}
          </h2>
        </div>
        <div className="solar-end__visual" data-reveal>
          <canvas
            ref={canvasRef}
            className="solar-end__canvas"
            role="img"
            aria-label="A minimal animated solar system diagram"
          />
        </div>
      </div>
    </section>
  );
}
