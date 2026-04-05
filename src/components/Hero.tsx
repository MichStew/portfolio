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

type LetterMotionValues = {
  x: number;
  y: number;
  z: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  skewX: number;
  skewY: number;
  tint: number;
};

type LetterMotionState = {
  current: LetterMotionValues;
  target: LetterMotionValues;
  velocity: LetterMotionValues;
};

const LETTER_MOTION_KEYS = [
  'x',
  'y',
  'z',
  'scaleX',
  'scaleY',
  'rotate',
  'skewX',
  'skewY',
  'tint',
] as const;

const LETTER_RADIUS = 300;
const LETTER_PUSH_X = 86;
const LETTER_PUSH_Y = 84;
const LETTER_ROTATION = 15;
const LETTER_SWIRL_X = 28;
const LETTER_SWIRL_Y = 28;
const LETTER_SKEW = 8;
const LETTER_DEPTH = 42;
const LETTER_TINT_SHIFT = 1.18;
const LETTER_ACTIVE_STIFFNESS = 0.028;
const LETTER_ACTIVE_DAMPING = 0.92;
const LETTER_RETURN_STIFFNESS = 0.008;
const LETTER_RETURN_DAMPING = 0.965;
const LETTER_RETURN_VERTICAL_STIFFNESS = 0.006;
const LETTER_RETURN_VERTICAL_DAMPING = 0.972;
const LETTER_SETTLE_EPSILON = 0.008;
const LETTER_VELOCITY_EPSILON = 0.008;

const createRestMotionValues = (): LetterMotionValues => ({
  x: 0,
  y: 0,
  z: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  skewX: 0,
  skewY: 0,
  tint: 0,
});

const createVelocityValues = (): LetterMotionValues => ({
  x: 0,
  y: 0,
  z: 0,
  scaleX: 0,
  scaleY: 0,
  rotate: 0,
  skewX: 0,
  skewY: 0,
  tint: 0,
});

export default function Hero({ name, reducedMotion }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const letterMetricsRef = useRef<LetterMetrics[]>([]);
  const letterMotionRef = useRef<LetterMotionState[]>([]);
  const pointerFrameRef = useRef<number | null>(null);
  const motionFrameRef = useRef<number | null>(null);
  const pointerInsideNameRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(true);
  const [motionReady, setMotionReady] = useState(false);
  const characters = Array.from(name);

  useEffect(() => {
    pointerInsideNameRef.current = false;
    letterMotionRef.current = characters.map(() => ({
      current: createRestMotionValues(),
      target: createRestMotionValues(),
      velocity: createVelocityValues(),
    }));

    const frame = window.requestAnimationFrame(() => {
      resetHeroShift();
      syncLetterMotionToDom();
      setLoaded(true);
      measureLetterMetrics();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      cancelPointerFrame();
      cancelMotionFrame();
    };
  }, [name]);

  useEffect(() => {
    setMotionReady(false);

    if (reducedMotion) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMotionReady(true);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [name, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !heroRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);

        if (!entry.isIntersecting) {
          cancelPointerFrame();
          cancelMotionFrame();
          pointerInsideNameRef.current = false;
          setHeroInteractionState('is-hero-active', false);
          setHeroInteractionState('is-name-active', false);
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
    if (reducedMotion || !motionReady || !inView) {
      cancelMotionFrame();

      if (reducedMotion) {
        setLetterDefaults();
      }

      return;
    }

    if (motionFrameRef.current === null) {
      motionFrameRef.current = window.requestAnimationFrame(runLetterMotion);
    }

    return () => cancelMotionFrame();
  }, [inView, motionReady, reducedMotion]);

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

  const cancelMotionFrame = () => {
    if (motionFrameRef.current !== null) {
      window.cancelAnimationFrame(motionFrameRef.current);
      motionFrameRef.current = null;
    }
  };

  const resetHeroShift = () => {
    if (!heroRef.current) {
      return;
    }

    heroRef.current.style.setProperty('--hero-shift-x', '0px');
    heroRef.current.style.setProperty('--hero-shift-y', '0px');
  };

  const setHeroInteractionState = (
    className: 'is-hero-active' | 'is-name-active',
    active: boolean,
  ) => {
    heroRef.current?.classList.toggle(className, active);
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

  const syncLetterMotionToDom = () => {
    letterRefs.current.forEach((letter, index) => {
      const motion = letterMotionRef.current[index];

      if (!letter || letter.dataset.space === 'true' || !motion) {
        return;
      }

      applyLetterState(
        letter,
        motion.current.x,
        motion.current.y,
        motion.current.z,
        motion.current.scaleX,
        motion.current.scaleY,
        motion.current.rotate,
        motion.current.skewX,
        motion.current.skewY,
        motion.current.tint,
      );
    });
  };

  const setLetterDefaults = () => {
    letterMotionRef.current = characters.map(() => ({
      current: createRestMotionValues(),
      target: createRestMotionValues(),
      velocity: createVelocityValues(),
    }));

    syncLetterMotionToDom();
  };

  const setLetterTargetsToRest = () => {
    letterMotionRef.current.forEach((motion) => {
      motion.target = createRestMotionValues();
    });
  };

  const getIdleMotion = (index: number, now: number) => {
    const phase = index * 0.68;

    return {
      y: Math.sin(now * 0.00115 + phase) * (4.5 + (index % 3) * 1.25),
      rotate: Math.sin(now * 0.00082 + phase) * 0.9,
    };
  };

  const runLetterMotion = (now: number) => {
    const pointerInsideName = pointerInsideNameRef.current;

    letterMotionRef.current.forEach((motion, index) => {
      const idleMotion = pointerInsideName ? { y: 0, rotate: 0 } : getIdleMotion(index, now);

      LETTER_MOTION_KEYS.forEach((key) => {
        const targetValue = motion.target[key] + (
          key === 'y'
            ? idleMotion.y
            : key === 'rotate'
              ? idleMotion.rotate
              : 0
        );
        const stiffness = pointerInsideName
          ? LETTER_ACTIVE_STIFFNESS
          : key === 'y'
            ? LETTER_RETURN_VERTICAL_STIFFNESS
            : LETTER_RETURN_STIFFNESS;
        const damping = pointerInsideName
          ? LETTER_ACTIVE_DAMPING
          : key === 'y'
            ? LETTER_RETURN_VERTICAL_DAMPING
            : LETTER_RETURN_DAMPING;

        motion.velocity[key] += (targetValue - motion.current[key]) * stiffness;
        motion.velocity[key] *= damping;
        motion.current[key] += motion.velocity[key];

        if (
          Math.abs(targetValue - motion.current[key]) < LETTER_SETTLE_EPSILON &&
          Math.abs(motion.velocity[key]) < LETTER_VELOCITY_EPSILON
        ) {
          motion.current[key] = targetValue;
          motion.velocity[key] = 0;
        }
      });
    });

    syncLetterMotionToDom();
    motionFrameRef.current = window.requestAnimationFrame(runLetterMotion);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion || !heroRef.current) {
      return;
    }

    if (!motionReady) {
      setMotionReady(true);
    }

    setHeroInteractionState('is-hero-active', true);

    const rect = heroRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const shiftX = ((x - 50) / 50) * 10;
    const shiftY = ((y - 50) / 50) * 9;

    heroRef.current.style.setProperty('--hero-shift-x', `${shiftX}px`);
    heroRef.current.style.setProperty('--hero-shift-y', `${shiftY}px`);
  };

  const handleNamePointerMove = (
    event: ReactPointerEvent<HTMLHeadingElement>,
  ) => {
    if (reducedMotion) {
      return;
    }

    if (!motionReady) {
      setMotionReady(true);
    }

    pointerInsideNameRef.current = true;
    setHeroInteractionState('is-name-active', true);

    const headingRect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - headingRect.left;
    const pointerY = event.clientY - headingRect.top;

    cancelPointerFrame();
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      letterMotionRef.current.forEach((motion, index) => {
        const metrics = letterMetricsRef.current[index];

        if (!metrics || metrics.isSpace) {
          return;
        }

        const dx = metrics.x - pointerX;
        const dy = metrics.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const normalizedForce = Math.max(0, 1 - distance / LETTER_RADIUS);
        const force = Math.pow(normalizedForce, 1.35);

        if (force <= 0.001) {
          motion.target = createRestMotionValues();
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
          phase * force * 12;
        const depth = force * LETTER_DEPTH;
        const scaleX = 1 + force * 0.3;
        const scaleY = 1 - force * 0.2;
        const rotate =
          (normalX * 0.65 + tangentX * 0.35) * force * LETTER_ROTATION;
        const skewX = tangentX * force * LETTER_SKEW;
        const skewY = -normalX * force * (LETTER_SKEW * 0.5);
        const tint = Math.min(1, force * (0.7 + Math.abs(phase) * 0.55));

        motion.target = {
          x: nextX,
          y: nextY,
          z: depth,
          scaleX,
          scaleY,
          rotate,
          skewX,
          skewY,
          tint: tint * LETTER_TINT_SHIFT,
        };
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
      } ${motionReady && !reducedMotion ? 'has-live-motion' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        cancelPointerFrame();
        pointerInsideNameRef.current = false;
        setHeroInteractionState('is-hero-active', false);
        setHeroInteractionState('is-name-active', false);
        resetHeroShift();
        setLetterTargetsToRest();
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
          onPointerEnter={() => {
            if (!motionReady) {
              setMotionReady(true);
            }

            measureLetterMetrics();
            pointerInsideNameRef.current = true;
            setHeroInteractionState('is-name-active', true);
          }}
          onPointerMove={handleNamePointerMove}
          onPointerLeave={() => {
            cancelPointerFrame();
            pointerInsideNameRef.current = false;
            setHeroInteractionState('is-name-active', false);
            setLetterTargetsToRest();
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
