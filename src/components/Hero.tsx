import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

type HeroProps = {
  name: string;
  reducedMotion: boolean;
};

type LetterMetrics = {
  x: number;
  y: number;
  isSpace: boolean;
};

const LETTER_RADIUS = 240;
const LETTER_PUSH_X = 52;
const LETTER_PUSH_Y = 34;
const LETTER_ROTATION = 8;
const LETTER_SWIRL_X = 14;
const LETTER_SWIRL_Y = 11;
const LETTER_SKEW = 5;
const LETTER_DEPTH = 24;
const LETTER_TINT_SHIFT = 1;

export default function Hero({ name, reducedMotion }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const letterMetricsRef = useRef<LetterMetrics[]>([]);
  const pointerFrameRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(true);
  const characters = Array.from(name);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      resetHeroShift();
      setLoaded(true);
      measureLetterMetrics();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      cancelPointerFrame();
    };
  }, [name]);

  useEffect(() => {
    if (reducedMotion || !heroRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);

        if (!entry.isIntersecting) {
          cancelPointerFrame();
          resetHeroShift();
          setLetterDefaults();
        }
      },
      {
        threshold: 0.16,
      },
    );

    observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    const heading = nameRef.current;

    if (!heading) {
      return;
    }

    const measure = () => {
      measureLetterMetrics();
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(heading);
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [name]);

  const cancelPointerFrame = () => {
    if (pointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }
  };

  const resetHeroShift = () => {
    if (!heroRef.current) {
      return;
    }

    heroRef.current.style.setProperty('--hero-shift-x', '0px');
    heroRef.current.style.setProperty('--hero-shift-y', '0px');
  };

  const measureLetterMetrics = () => {
    const heading = nameRef.current;

    if (!heading) {
      return;
    }

    const headingRect = heading.getBoundingClientRect();

    letterMetricsRef.current = letterRefs.current.map((letter) => {
      if (!letter) {
        return { x: 0, y: 0, isSpace: true };
      }

      const isSpace = letter.dataset.space === 'true';

      if (isSpace) {
        return { x: 0, y: 0, isSpace: true };
      }

      const rect = letter.getBoundingClientRect();

      return {
        x: rect.left - headingRect.left + rect.width / 2,
        y: rect.top - headingRect.top + rect.height / 2,
        isSpace: false,
      };
    });
  };

  const applyLetterState = (
    letter: HTMLSpanElement,
    x: number,
    y: number,
    z: number,
    scaleX: number,
    scaleY: number,
    rotate: number,
    skewX: number,
    skewY: number,
    tint: number,
  ) => {
    letter.style.setProperty('--letter-x', `${x}px`);
    letter.style.setProperty('--letter-y', `${y}px`);
    letter.style.setProperty('--letter-z', `${z}px`);
    letter.style.setProperty('--letter-scale-x', `${scaleX}`);
    letter.style.setProperty('--letter-scale-y', `${scaleY}`);
    letter.style.setProperty('--letter-rotate', `${rotate}deg`);
    letter.style.setProperty('--letter-skew-x', `${skewX}deg`);
    letter.style.setProperty('--letter-skew-y', `${skewY}deg`);
    letter.style.setProperty('--letter-tint', `${tint}`);
  };

  const setLetterDefaults = () => {
    letterRefs.current.forEach((letter) => {
      if (!letter || letter.dataset.space === 'true') {
        return;
      }

      applyLetterState(letter, 0, 0, 0, 1, 1, 0, 0, 0, 0);
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion || !heroRef.current) {
      return;
    }

    const rect = heroRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const shiftX = ((x - 50) / 50) * 4;
    const shiftY = ((y - 50) / 50) * 4;

    heroRef.current.style.setProperty('--hero-shift-x', `${shiftX}px`);
    heroRef.current.style.setProperty('--hero-shift-y', `${shiftY}px`);
  };

  const handleNamePointerMove = (
    event: ReactPointerEvent<HTMLHeadingElement>,
  ) => {
    if (reducedMotion) {
      return;
    }

    const headingRect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - headingRect.left;
    const pointerY = event.clientY - headingRect.top;

    cancelPointerFrame();
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      letterRefs.current.forEach((letter, index) => {
        const metrics = letterMetricsRef.current[index];

        if (!letter || !metrics || metrics.isSpace) {
          return;
        }

        const dx = metrics.x - pointerX;
        const dy = metrics.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const normalizedForce = Math.max(0, 1 - distance / LETTER_RADIUS);
        const force = Math.pow(normalizedForce, 1.7);

        if (force <= 0.001) {
          applyLetterState(letter, 0, 0, 0, 1, 1, 0, 0, 0, 0);
          return;
        }

        const safeDistance = distance || 1;
        const normalX = dx / safeDistance;
        const normalY = dy / safeDistance;
        const tangentX = -normalY;
        const tangentY = normalX;
        const phase = characters.length <= 1
          ? 0
          : index / (characters.length - 1) - 0.5;

        const nextX =
          normalX * force * LETTER_PUSH_X + tangentX * force * LETTER_SWIRL_X;
        const nextY =
          normalY * force * LETTER_PUSH_Y +
          tangentY * force * LETTER_SWIRL_Y +
          phase * force * 8;
        const depth = force * LETTER_DEPTH;
        const scaleX = 1 + force * 0.22;
        const scaleY = 1 - force * 0.16;
        const rotate =
          (normalX * 0.65 + tangentX * 0.35) * force * LETTER_ROTATION;
        const skewX = tangentX * force * LETTER_SKEW;
        const skewY = -normalX * force * (LETTER_SKEW * 0.5);
        const tint = Math.min(1, force * (0.7 + Math.abs(phase) * 0.55));

        applyLetterState(
          letter,
          nextX,
          nextY,
          depth,
          scaleX,
          scaleY,
          rotate,
          skewX,
          skewY,
          tint * LETTER_TINT_SHIFT,
        );
      });

      pointerFrameRef.current = null;
    });
  };

  return (
    <section
      id="top"
      ref={heroRef}
      className={`hero ${loaded ? 'is-loaded' : ''} ${
        inView ? 'is-in-view' : ''
      }`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        cancelPointerFrame();
        resetHeroShift();
        setLetterDefaults();
      }}
      aria-label={name}
    >
      <div className="hero__background" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__scanlines" />
        <div className="hero__vignette" />
      </div>
      <div className="hero__content">
        <h1
          ref={nameRef}
          className="hero__name"
          onPointerEnter={measureLetterMetrics}
          onPointerMove={handleNamePointerMove}
          onPointerLeave={() => {
            cancelPointerFrame();
            setLetterDefaults();
          }}
          aria-label={name}
        >
          {characters.map((character, index) => {
            const isSpace = character === ' ';

            return (
              <span
                key={`${character}-${index}`}
                ref={(node) => {
                  letterRefs.current[index] = node;
                }}
                className={`hero__letter ${isSpace ? 'is-space' : ''}`}
                data-space={isSpace ? 'true' : 'false'}
                data-letter={isSpace ? '' : character}
                aria-hidden="true"
              >
                {isSpace ? '\u00A0' : character}
              </span>
            );
          })}
        </h1>
      </div>
      <div className="hero__scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
