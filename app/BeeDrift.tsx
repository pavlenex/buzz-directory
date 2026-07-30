"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const beeCount = 24;
const tones = ["acid", "pink", "blue", "mint"] as const;

type BeeState = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  velocityX: number;
  velocityY: number;
  wanderAngle: number;
  seed: number;
  cruiseSpeed: number;
  burstEvery: number;
};

type BeeStyle = CSSProperties & {
  "--bee-size": string;
  "--wing-cycle": string;
  "--wing-delay": string;
};

const fractionalPart = (value: number) => value - Math.floor(value);

function beeStyle(index: number): BeeStyle {
  return {
    "--bee-size": `${38 + ((index * 13) % 26)}px`,
    "--wing-cycle": `${2.6 + ((index * 17) % 19) / 10}s`,
    "--wing-delay": `${-((index * 31) % 43) / 10}s`,
  };
}

function BeeArtwork() {
  return (
    <svg viewBox="0 0 64 48" role="presentation">
      <ellipse className="bee-wing bee-wing-top" cx="26" cy="15" rx="14" ry="8" />
      <ellipse className="bee-wing bee-wing-bottom" cx="26" cy="33" rx="14" ry="8" />
      <ellipse className="bee-body" cx="35" cy="24" rx="18" ry="12" />
      <path className="bee-stripe" d="M27 13.8c-2 6.4-2 13.9 0 20.4" />
      <path className="bee-stripe" d="M37 12.2c-2 7.7-2 15.9 0 23.6" />
      <circle className="bee-head" cx="53" cy="24" r="8" />
      <circle className="bee-eye" cx="56" cy="21" r="1.8" />
      <path className="bee-stinger" d="m17 24-8-4 2 8Z" />
    </svg>
  );
}

export function BeeDrift() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const beeElements = Array.from(
      field.querySelectorAll<HTMLElement>(".drift-bee"),
    );
    let width = Math.max(field.clientWidth, 1);
    let height = Math.max(field.clientHeight, 1);

    const bees: BeeState[] = beeElements.map((element, index) => {
      const seed = fractionalPart((index + 1) * 0.754877666);
      const x = width * fractionalPart((index + 1) * 0.618033989);
      const y = height * ((index + 0.5) / beeElements.length);
      const wanderAngle = seed * Math.PI * 2;
      const cruiseSpeed = 18 + ((index * 11) % 17);

      element.style.opacity = "1";

      return {
        x,
        y,
        homeX: x,
        homeY: y,
        velocityX: Math.cos(wanderAngle) * cruiseSpeed,
        velocityY: Math.sin(wanderAngle) * cruiseSpeed,
        wanderAngle,
        seed,
        cruiseSpeed,
        burstEvery: 3.4 + ((index * 7) % 23) / 10,
      };
    });

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(field.clientWidth, 1);
      const nextHeight = Math.max(field.clientHeight, 1);
      const scaleX = nextWidth / width;
      const scaleY = nextHeight / height;

      for (const bee of bees) {
        bee.x *= scaleX;
        bee.y *= scaleY;
        bee.homeX *= scaleX;
        bee.homeY *= scaleY;
      }

      width = nextWidth;
      height = nextHeight;
    });
    resizeObserver.observe(field);

    let animationFrame = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const elapsed = Math.min((time - lastTime) / 1000, 0.05);
      const seconds = time / 1000;
      lastTime = time;

      for (let index = 0; index < bees.length; index += 1) {
        const bee = bees[index];
        const element = beeElements[index];
        const burstPhase =
          fractionalPart((seconds + bee.seed * 13) / bee.burstEvery);
        const burst =
          burstPhase < 0.14
            ? Math.sin((burstPhase / 0.14) * Math.PI)
            : 0;

        const steeringNoise =
          Math.sin(seconds * (0.72 + bee.seed * 0.31) + bee.seed * 19) +
          Math.sin(seconds * (1.37 + bee.seed * 0.23) + bee.seed * 7) * 0.45;
        bee.wanderAngle += steeringNoise * elapsed * (0.72 + burst * 1.25);

        const desiredSpeed = bee.cruiseSpeed + burst * 86;
        const desiredVelocityX = Math.cos(bee.wanderAngle) * desiredSpeed;
        const desiredVelocityY = Math.sin(bee.wanderAngle) * desiredSpeed;
        const acceleration = Math.min(1, elapsed * (2.4 + burst * 7));

        bee.velocityX +=
          (desiredVelocityX - bee.velocityX) * acceleration;
        bee.velocityY +=
          (desiredVelocityY - bee.velocityY) * acceleration;

        const roamingHomeX =
          bee.homeX + Math.sin(seconds * 0.09 + bee.seed * 23) * 78;
        const roamingHomeY =
          bee.homeY + Math.cos(seconds * 0.07 + bee.seed * 17) * 54;
        bee.velocityX += (roamingHomeX - bee.x) * elapsed * 0.16;
        bee.velocityY += (roamingHomeY - bee.y) * elapsed * 0.16;

        for (let otherIndex = 0; otherIndex < bees.length; otherIndex += 1) {
          if (otherIndex === index) continue;
          const other = bees[otherIndex];
          const deltaX = bee.x - other.x;
          const deltaY = bee.y - other.y;
          const distanceSquared = deltaX * deltaX + deltaY * deltaY;

          if (distanceSquared > 0 && distanceSquared < 58 * 58) {
            const distance = Math.sqrt(distanceSquared);
            const separation = (58 - distance) * elapsed * 0.85;
            bee.velocityX += (deltaX / distance) * separation;
            bee.velocityY += (deltaY / distance) * separation;
          }
        }

        bee.x += bee.velocityX * elapsed;
        bee.y += bee.velocityY * elapsed;

        const edge = 24;
        if (bee.x < edge || bee.x > width - edge) {
          bee.x = Math.min(Math.max(bee.x, edge), width - edge);
          bee.velocityX *= -0.82;
          bee.wanderAngle = Math.atan2(bee.velocityY, bee.velocityX);
        }
        if (bee.y < edge || bee.y > height - edge) {
          bee.y = Math.min(Math.max(bee.y, edge), height - edge);
          bee.velocityY *= -0.82;
          bee.wanderAngle = Math.atan2(bee.velocityY, bee.velocityX);
        }

        const travelAngle = Math.atan2(bee.velocityY, bee.velocityX);
        element.style.transform = `translate3d(${bee.x}px, ${bee.y}px, 0) rotate(${travelAngle}rad)`;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      window.cancelAnimationFrame(animationFrame);
      if (!document.hidden) {
        lastTime = performance.now();
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="bee-drift-field" aria-hidden="true" ref={fieldRef}>
      {Array.from({ length: beeCount }, (_, index) => (
        <span
          className={[
            "drift-bee",
            `drift-bee-${tones[index % tones.length]}`,
          ].join(" ")}
          key={index}
          style={beeStyle(index)}
        >
          <BeeArtwork />
        </span>
      ))}
    </div>
  );
}
