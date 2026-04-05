import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type SpaceFlightPageProps = {
  reducedMotion: boolean;
};

type FlightControlKey = 'w' | 'a' | 's' | 'd';

type PlanetDefinition = {
  id: string;
  name: string;
  label: string;
  description: string;
  radius: number;
  position: readonly [number, number, number];
  surfaceColor: string;
  atmosphereColor: string;
  beaconColor: string;
  ringColor?: string;
  spinSpeed: number;
};

type Telemetry = {
  speed: string;
  heading: string;
  nearestPlanet: string;
  nearestDistance: string;
  targetPlanet: string;
  targetDistance: string;
};

type PlanetRuntime = {
  definition: PlanetDefinition;
  group: THREE.Group;
  core: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  atmosphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  beacon: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  ring?: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
};

const INITIAL_TOUCH_INPUT: Record<FlightControlKey, boolean> = {
  w: false,
  a: false,
  s: false,
  d: false,
};

const PLANETS: readonly PlanetDefinition[] = [
  {
    id: 'mars',
    name: 'Mars',
    label: 'Iron Basin',
    description:
      'A warm rust world parked closest to the lane. It is the quick shakedown target for the first docking pass.',
    radius: 4.6,
    position: [-14, 2, 22],
    surfaceColor: '#b2573c',
    atmosphereColor: '#ffb07a',
    beaconColor: '#ff8d61',
    spinSpeed: 0.11,
  },
  {
    id: 'europa',
    name: 'Europa',
    label: 'Ice Relay',
    description:
      'A colder waypoint with a pale shell and cleaner light bloom. It sits deeper in the route and rewards a smoother line.',
    radius: 4.3,
    position: [18, -4, 58],
    surfaceColor: '#cad8eb',
    atmosphereColor: '#90d9ff',
    beaconColor: '#7ae7ff',
    spinSpeed: 0.08,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    label: 'Ring Gate',
    description:
      'The wide-body finale. The ringed silhouette gives the route a distant anchor and a clear last objective.',
    radius: 7.1,
    position: [40, 6, 94],
    surfaceColor: '#d8b17c',
    atmosphereColor: '#ffe2a8',
    beaconColor: '#ffd48c',
    ringColor: '#f7e2bb',
    spinSpeed: 0.05,
  },
] as const;

const TOUCH_CONTROLS: ReadonlyArray<{
  key: FlightControlKey;
  label: string;
  detail: string;
}> = [
  { key: 'w', label: 'W', detail: 'Thrust' },
  { key: 'a', label: 'A', detail: 'Yaw Left' },
  { key: 's', label: 'S', detail: 'Brake' },
  { key: 'd', label: 'D', detail: 'Yaw Right' },
];

const createShip = () => {
  const ship = new THREE.Group();
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#edf3ff'),
    emissive: new THREE.Color('#1d2942'),
    emissiveIntensity: 0.45,
    metalness: 0.72,
    roughness: 0.28,
  });
  const cockpitMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8fdcff'),
    emissive: new THREE.Color('#62e7ff'),
    emissiveIntensity: 1.35,
    metalness: 0.18,
    roughness: 0.12,
    transparent: true,
    opacity: 0.92,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#9eb8ff'),
    emissive: new THREE.Color('#385de2'),
    emissiveIntensity: 0.8,
    metalness: 0.5,
    roughness: 0.3,
  });
  const engineMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#67efff'),
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.72, 4.9, 16), hullMaterial);
  hull.rotation.x = Math.PI / 2;
  ship.add(hull);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.55, 16), hullMaterial);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 3.15;
  ship.add(nose);

  const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 0.8, 12), accentMaterial);
  intake.rotation.x = Math.PI / 2;
  intake.position.z = -2.55;
  ship.add(intake);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), cockpitMaterial);
  cockpit.scale.set(1.2, 0.68, 1);
  cockpit.position.set(0, 0.46, 0.1);
  ship.add(cockpit);

  const wingGeometry = new THREE.BoxGeometry(2.4, 0.14, 1.25);
  const wingLeft = new THREE.Mesh(wingGeometry, hullMaterial);
  wingLeft.position.set(-1.48, -0.05, 0.4);
  ship.add(wingLeft);

  const wingRight = wingLeft.clone();
  wingRight.position.x = 1.48;
  ship.add(wingRight);

  const stabilizerGeometry = new THREE.BoxGeometry(0.24, 1.15, 1);
  const stabilizerLeft = new THREE.Mesh(stabilizerGeometry, accentMaterial);
  stabilizerLeft.position.set(-0.58, 0.46, -1.6);
  ship.add(stabilizerLeft);

  const stabilizerRight = stabilizerLeft.clone();
  stabilizerRight.position.x = 0.58;
  ship.add(stabilizerRight);

  const engineGlow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.5, 18, 1, true), engineMaterial);
  engineGlow.rotation.x = -Math.PI / 2;
  engineGlow.position.z = -3.25;
  ship.add(engineGlow);

  const engineCore = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({
    color: new THREE.Color('#c2ffff'),
    transparent: true,
    opacity: 0.92,
  }));
  engineCore.position.z = -2.72;
  ship.add(engineCore);

  return { ship, engineGlow, engineCore };
};

const createPlanet = (definition: PlanetDefinition): PlanetRuntime => {
  const group = new THREE.Group();
  group.position.set(...definition.position);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(definition.radius, 48, 48),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(definition.surfaceColor),
      emissive: new THREE.Color(definition.surfaceColor),
      emissiveIntensity: 0.18,
      roughness: 0.94,
      metalness: 0.04,
    }),
  );
  group.add(core);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(definition.radius * 1.08, 36, 36),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(definition.atmosphereColor),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  group.add(atmosphere);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(definition.radius * 0.12, definition.radius * 0.4, 20, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(definition.beaconColor),
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beacon.position.y = definition.radius + 10;
  group.add(beacon);

  let ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial> | undefined;

  if (definition.ringColor) {
    ring = new THREE.Mesh(
      new THREE.TorusGeometry(definition.radius * 1.6, 0.22, 18, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(definition.ringColor),
        transparent: true,
        opacity: 0.42,
      }),
    );
    ring.rotation.x = Math.PI / 2.45;
    group.add(ring);
  }

  return { definition, group, core, atmosphere, beacon, ring };
};

const createStarField = (count: number, spread: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = THREE.MathUtils.randFloatSpread(spread);
    positions[index * 3 + 1] = THREE.MathUtils.randFloatSpread(spread * 0.7);
    positions[index * 3 + 2] = THREE.MathUtils.randFloatSpread(spread);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: new THREE.Color('#f4fbff'),
      size: 0.34,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    }),
  );
};

const formatDistance = (distance: number) => `${distance.toFixed(1)} u`;

export default function SpaceFlightPage({
  reducedMotion,
}: SpaceFlightPageProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const touchInputRef = useRef(INITIAL_TOUCH_INPUT);
  const targetPlanetIdRef = useRef(PLANETS[0].id);
  const resetRequestedRef = useRef(false);
  const [touchInput, setTouchInput] = useState(INITIAL_TOUCH_INPUT);
  const [targetPlanetId, setTargetPlanetId] = useState<string>(PLANETS[0].id);
  const [visitedPlanetIds, setVisitedPlanetIds] = useState<string[]>([]);
  const [missionMessage, setMissionMessage] = useState(
    'Launch from the lane, align with the active beacon, and complete all three approaches manually.',
  );
  const [telemetry, setTelemetry] = useState<Telemetry>({
    speed: '0.0 u/s',
    heading: '000°',
    nearestPlanet: PLANETS[0].name,
    nearestDistance: '0.0 u',
    targetPlanet: PLANETS[0].name,
    targetDistance: '0.0 u',
  });

  useEffect(() => {
    touchInputRef.current = touchInput;
  }, [touchInput]);

  useEffect(() => {
    targetPlanetIdRef.current = targetPlanetId;
  }, [targetPlanetId]);

  useEffect(() => {
    const container = viewportRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#03060b');
    scene.fog = new THREE.FogExp2(0x03060b, reducedMotion ? 0.009 : 0.0065);

    const renderer = new THREE.WebGLRenderer({
      antialias: !reducedMotion,
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, reducedMotion ? 1.35 : 1.8));
    renderer.domElement.className = 'flight-console__canvas';
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 420);
    const ambientLight = new THREE.AmbientLight(0xb5c7ff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x9ec5ff, 220, 0, 1.7);
    keyLight.position.set(-20, 22, -18);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xffc893, 110, 0, 1.9);
    fillLight.position.set(62, -12, 120);
    scene.add(fillLight);

    const starField = createStarField(reducedMotion ? 1100 : 1800, 240);
    scene.add(starField);

    const navigationRing = new THREE.Mesh(
      new THREE.TorusGeometry(5.8, 0.08, 14, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#5ac9ff'),
        transparent: true,
        opacity: reducedMotion ? 0.18 : 0.26,
      }),
    );
    navigationRing.rotation.x = Math.PI / 2;
    navigationRing.position.set(0, -0.8, 0);
    scene.add(navigationRing);

    const { ship, engineGlow, engineCore } = createShip();
    ship.position.set(0, 0.2, -18);
    scene.add(ship);

    const planetRuntimes = PLANETS.map((planet) => {
      const runtime = createPlanet(planet);
      scene.add(runtime.group);
      return runtime;
    });

    const keyboardState: Record<FlightControlKey, boolean> = {
      w: false,
      a: false,
      s: false,
      d: false,
    };
    const visitedSet = new Set<string>();
    const shipForward = new THREE.Vector3();
    const chaseOffset = new THREE.Vector3(0, 4.2, -12.5);
    const desiredCameraPosition = new THREE.Vector3();
    const desiredLookTarget = new THREE.Vector3();
    const cameraLookTarget = new THREE.Vector3();
    const shipBasePosition = new THREE.Vector3();
    const localOffset = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const clock = new THREE.Clock();
    let frameId = 0;
    let lastTelemetryCommit = 0;
    let shipSpeed = 0;
    let shipYaw = 0;

    const handleResize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const getControlState = (key: FlightControlKey) =>
      keyboardState[key] || touchInputRef.current[key];

    const onKeyChange = (event: KeyboardEvent, active: boolean) => {
      const key = event.key.toLowerCase();

      if (key !== 'w' && key !== 'a' && key !== 's' && key !== 'd') {
        return;
      }

      event.preventDefault();
      keyboardState[key] = active;
    };

    const onKeyDown = (event: KeyboardEvent) => onKeyChange(event, true);
    const onKeyUp = (event: KeyboardEvent) => onKeyChange(event, false);

    const resetFlight = () => {
      ship.position.set(0, 0.2, -18);
      ship.rotation.set(0, 0, 0);
      shipSpeed = 0;
      shipYaw = 0;
      visitedSet.clear();
      setVisitedPlanetIds([]);
      setTargetPlanetId(PLANETS[0].id);
      setMissionMessage('Flight deck reset. Launch again and run the route from Mars.');
    };

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (resetRequestedRef.current) {
        resetRequestedRef.current = false;
        resetFlight();
      }

      const thrusting = getControlState('w');
      const braking = getControlState('s');
      const turningLeft = getControlState('a');
      const turningRight = getControlState('d');

      if (turningLeft) {
        shipYaw -= 1.75 * delta;
      }

      if (turningRight) {
        shipYaw += 1.75 * delta;
      }

      if (thrusting) {
        shipSpeed = Math.min(shipSpeed + 18 * delta, 24);
      } else if (braking) {
        shipSpeed = Math.max(shipSpeed - 20 * delta, -8);
      } else {
        shipSpeed = THREE.MathUtils.damp(shipSpeed, 0, 3.2, delta);
      }

      shipForward.set(Math.sin(shipYaw), 0, Math.cos(shipYaw));
      ship.position.addScaledVector(shipForward, shipSpeed * delta);
      ship.position.x = THREE.MathUtils.clamp(ship.position.x, -90, 90);
      ship.position.z = THREE.MathUtils.clamp(ship.position.z, -36, 132);
      ship.position.y = Math.sin(elapsed * 1.3) * 0.18 + shipSpeed * 0.02;

      ship.rotation.y = shipYaw;
      ship.rotation.z = THREE.MathUtils.damp(
        ship.rotation.z,
        turningLeft ? 0.32 : turningRight ? -0.32 : 0,
        6,
        delta,
      );
      ship.rotation.x = THREE.MathUtils.damp(
        ship.rotation.x,
        THREE.MathUtils.clamp(shipSpeed * 0.012, -0.12, 0.24),
        5,
        delta,
      );

      const engineScale = THREE.MathUtils.clamp(0.78 + Math.max(shipSpeed, 0) * 0.03 + (thrusting ? 0.45 : 0), 0.72, 1.85);
      engineGlow.scale.set(1, engineScale, 1);
      engineGlow.material.opacity = THREE.MathUtils.lerp(
        engineGlow.material.opacity,
        thrusting ? 0.96 : shipSpeed > 0.5 ? 0.72 : 0.38,
        0.08,
      );
      engineCore.scale.setScalar(0.9 + Math.max(shipSpeed, 0) * 0.018 + (thrusting ? 0.24 : 0));

      navigationRing.rotation.z += reducedMotion ? 0.0015 : 0.0035;
      navigationRing.material.opacity = THREE.MathUtils.lerp(
        navigationRing.material.opacity,
        ship.position.distanceToSquared(shipBasePosition.set(0, -0.8, 0)) < 220 ? 0.26 : 0.08,
        0.04,
      );

      let nearestPlanet = PLANETS[0];
      let nearestDistance = Number.POSITIVE_INFINITY;
      let activeTargetDistance = Number.POSITIVE_INFINITY;

      for (const runtime of planetRuntimes) {
        const { definition, core, atmosphere, beacon, ring } = runtime;
        runtime.group.rotation.y += definition.spinSpeed * delta * 0.36;
        core.rotation.y += definition.spinSpeed * delta;
        atmosphere.rotation.y -= definition.spinSpeed * delta * 0.5;

        const isTarget = targetPlanetIdRef.current === definition.id;
        const distance = ship.position.distanceTo(runtime.group.position);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPlanet = definition;
        }

        if (isTarget) {
          activeTargetDistance = distance;
        }

        const beaconMaterial = beacon.material as THREE.MeshBasicMaterial;
        const targetOpacity = isTarget
          ? (reducedMotion ? 0.22 : 0.16 + (Math.sin(elapsed * 2.6) + 1) * 0.1)
          : 0.06;

        beaconMaterial.opacity = THREE.MathUtils.lerp(beaconMaterial.opacity, targetOpacity, 0.12);
        atmosphere.material.opacity = THREE.MathUtils.lerp(
          atmosphere.material.opacity,
          visitedSet.has(definition.id) ? 0.27 : 0.18,
          0.08,
        );
        core.material.emissiveIntensity = THREE.MathUtils.lerp(
          core.material.emissiveIntensity,
          visitedSet.has(definition.id) ? 0.32 : isTarget ? 0.24 : 0.18,
          0.08,
        );

        if (ring) {
          const ringMaterial = ring.material as THREE.MeshBasicMaterial;
          ring.rotation.z += 0.08 * delta;
          ringMaterial.opacity = THREE.MathUtils.lerp(
            ringMaterial.opacity,
            isTarget ? 0.62 : 0.42,
            0.08,
          );
        }

        if (!visitedSet.has(definition.id) && distance <= definition.radius + 3.4) {
          visitedSet.add(definition.id);
          setVisitedPlanetIds(Array.from(visitedSet));

          if (definition.id === targetPlanetIdRef.current) {
            const nextTarget = PLANETS.find((planet) => !visitedSet.has(planet.id));

            if (nextTarget) {
              setTargetPlanetId(nextTarget.id);
              setMissionMessage(`Docked with ${definition.name}. Beacon shifted to ${nextTarget.name}.`);
            } else {
              setMissionMessage('All three planets have been reached. Cruise freely or reset the lane for another run.');
            }
          } else {
            const targetName = PLANETS.find((planet) => planet.id === targetPlanetIdRef.current)?.name ?? 'the active beacon';
            setMissionMessage(`${definition.name} logged. The current beacon remains locked on ${targetName}.`);
          }
        }
      }

      localOffset.copy(chaseOffset).applyAxisAngle(THREE.Object3D.DEFAULT_UP, shipYaw);
      desiredCameraPosition.copy(ship.position).add(localOffset);
      desiredLookTarget.copy(ship.position).addScaledVector(shipForward, 12);
      desiredLookTarget.y += 1.2;
      camera.position.lerp(desiredCameraPosition, 0.1);
      cameraLookTarget.lerp(desiredLookTarget, 0.16);
      camera.lookAt(cameraLookTarget);

      starField.position.copy(ship.position);

      if (elapsed - lastTelemetryCommit > 0.1) {
        const heading = ((THREE.MathUtils.radToDeg(shipYaw) % 360) + 360) % 360;
        const activeTarget = PLANETS.find((planet) => planet.id === targetPlanetIdRef.current) ?? PLANETS[0];
        targetPosition.set(...activeTarget.position);

        if (!Number.isFinite(activeTargetDistance)) {
          activeTargetDistance = ship.position.distanceTo(targetPosition);
        }

        setTelemetry({
          speed: `${Math.abs(shipSpeed).toFixed(1)} u/s`,
          heading: `${heading.toFixed(0).padStart(3, '0')}°`,
          nearestPlanet: nearestPlanet.name,
          nearestDistance: formatDistance(nearestDistance),
          targetPlanet: activeTarget.name,
          targetDistance: formatDistance(activeTargetDistance),
        });
        lastTelemetryCommit = elapsed;
      }

      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      resizeObserver.disconnect();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if ('map' in material && material.map) {
              material.map.dispose();
            }

            material.dispose();
          });
        }

        if (object instanceof THREE.Points) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });

      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  const handleTouchControl = (key: FlightControlKey, active: boolean) => {
    setTouchInput((current) => {
      if (current[key] === active) {
        return current;
      }

      return {
        ...current,
        [key]: active,
      };
    });
  };

  const handleTargetChange = (planetId: string) => {
    const nextPlanet = PLANETS.find((planet) => planet.id === planetId);

    if (!nextPlanet) {
      return;
    }

    setTargetPlanetId(planetId);
    setMissionMessage(`Beacon locked to ${nextPlanet.name}. Thrust in, trim your heading, and finish the approach manually.`);
  };

  const handleResetFlight = () => {
    resetRequestedRef.current = true;
    setTouchInput(INITIAL_TOUCH_INPUT);
  };

  return (
    <div className="flight-page">
      <section className="flight-hero" id="hangar-briefing" data-reveal>
        <div className="flight-hero__copy">
          <span className="flight-hero__eyebrow">Flight Deck</span>
          <h1>Three.js starfighter run with a separate header tab.</h1>
          <p>
            This view breaks out from the portfolio into a dedicated space sim.
            The ship is built from simple geometry, the planets are stylized,
            and the route is intentionally manual so you can fly the line with
            <span> WASD </span>
            instead of teleporting.
          </p>
        </div>

        <div className="flight-hero__stats">
          <article className="flight-hero__stat">
            <span>Active Beacon</span>
            <strong>{telemetry.targetPlanet}</strong>
            <p>{telemetry.targetDistance} out</p>
          </article>
          <article className="flight-hero__stat">
            <span>Nearest Body</span>
            <strong>{telemetry.nearestPlanet}</strong>
            <p>{telemetry.nearestDistance} away</p>
          </article>
          <article className="flight-hero__stat">
            <span>Mission Track</span>
            <strong>{visitedPlanetIds.length}/{PLANETS.length}</strong>
            <p>Planet approaches completed</p>
          </article>
        </div>
      </section>

      <section className="flight-console-section" id="flight-controls">
        <div className="flight-console-section__header" data-reveal>
          <div>
            <span className="flight-hero__eyebrow">Manual Controls</span>
            <h2>Fly the ship, don’t just click the planets.</h2>
          </div>
          <p>{missionMessage}</p>
        </div>

        <div className="flight-console" data-reveal>
          <div className="flight-console__stage">
            <div className="flight-console__hud flight-console__hud--top">
              <div>
                <span>Velocity</span>
                <strong>{telemetry.speed}</strong>
              </div>
              <div>
                <span>Heading</span>
                <strong>{telemetry.heading}</strong>
              </div>
            </div>

            <div className="flight-console__viewport" ref={viewportRef} />

            <div className="flight-console__hud flight-console__hud--bottom">
              <div>
                <span>Target</span>
                <strong>{telemetry.targetPlanet}</strong>
                <p>{telemetry.targetDistance}</p>
              </div>
              <div>
                <span>Nearest</span>
                <strong>{telemetry.nearestPlanet}</strong>
                <p>{telemetry.nearestDistance}</p>
              </div>
            </div>
          </div>

          <aside className="flight-console__panel">
            <div className="flight-console__panel-block">
              <span className="flight-console__label">Keyboard</span>
              <ul className="flight-console__control-list">
                <li><strong>W</strong> Push forward thrust</li>
                <li><strong>S</strong> Brake or reverse your line</li>
                <li><strong>A / D</strong> Yaw left and right</li>
              </ul>
            </div>

            <div className="flight-console__panel-block">
              <span className="flight-console__label">Beacons</span>
              <div className="flight-console__destination-list">
                {PLANETS.map((planet) => {
                  const isActive = targetPlanetId === planet.id;
                  const isVisited = visitedPlanetIds.includes(planet.id);

                  return (
                    <button
                      key={planet.id}
                      type="button"
                      className={`flight-console__destination-button ${
                        isActive ? 'is-active' : ''
                      } ${isVisited ? 'is-visited' : ''}`}
                      onClick={() => handleTargetChange(planet.id)}
                    >
                      <span>{planet.name}</span>
                      <small>{isVisited ? 'Visited' : planet.label}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="flight-console__reset"
              onClick={handleResetFlight}
            >
              Reset Flight
            </button>
          </aside>
        </div>

        <div className="flight-console__touchpad" data-reveal>
          {TOUCH_CONTROLS.map((control) => (
            <button
              key={control.key}
              type="button"
              className={`flight-console__touch-button ${
                touchInput[control.key] ? 'is-active' : ''
              }`}
              onPointerDown={() => handleTouchControl(control.key, true)}
              onPointerUp={() => handleTouchControl(control.key, false)}
              onPointerLeave={() => handleTouchControl(control.key, false)}
              onPointerCancel={() => handleTouchControl(control.key, false)}
            >
              <strong>{control.label}</strong>
              <span>{control.detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="flight-destinations" id="destinations">
        {PLANETS.map((planet) => {
          const isActive = targetPlanetId === planet.id;
          const isVisited = visitedPlanetIds.includes(planet.id);

          return (
            <article
              key={planet.id}
              className={`flight-destinations__card ${
                isActive ? 'is-active' : ''
              } ${isVisited ? 'is-visited' : ''}`}
              data-reveal
            >
              <div className="flight-destinations__topline">
                <span>{planet.name}</span>
                <strong>{planet.label}</strong>
              </div>
              <p>{planet.description}</p>
              <div className="flight-destinations__status">
                <span>{isActive ? 'Active beacon' : 'Available target'}</span>
                <strong>{isVisited ? 'Approach logged' : 'Awaiting approach'}</strong>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
