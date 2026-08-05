"use client";

import { useRef, type PointerEvent } from "react";
import styles from "./sky-orb.module.css";

type OrbPosition = {
  x: string;
  y: string;
  rotateX: string;
  rotateY: string;
  shiftX: string;
  shiftY: string;
};

const restingPosition: OrbPosition = {
  x: "34%",
  y: "28%",
  rotateX: "0deg",
  rotateY: "0deg",
  shiftX: "0px",
  shiftY: "0px"
} as const;

export function SkyOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  function setOrbPosition(position: OrbPosition) {
    const orb = orbRef.current;

    if (!orb) return;

    orb.style.setProperty("--light-x", position.x);
    orb.style.setProperty("--light-y", position.y);
    orb.style.setProperty("--rotate-x", position.rotateX);
    orb.style.setProperty("--rotate-y", position.rotateY);
    orb.style.setProperty("--shift-x", position.shiftX);
    orb.style.setProperty("--shift-y", position.shiftY);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1
    );
    const y = Math.min(
      Math.max((event.clientY - bounds.top) / bounds.height, 0),
      1
    );

    setOrbPosition({
      x: `${22 + x * 56}%`,
      y: `${18 + y * 48}%`,
      rotateX: `${(0.5 - y) * 9}deg`,
      rotateY: `${(x - 0.5) * 11}deg`,
      shiftX: `${(x - 0.5) * 18}px`,
      shiftY: `${(y - 0.5) * 14}px`
    });
  }

  return (
    <div
      className={styles.stage}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setOrbPosition(restingPosition)}
      aria-hidden="true"
    >
      <div className={styles.ambient} />
      <div className={styles.orbit}>
        <span className={styles.orbitDot} />
      </div>
      <div ref={orbRef} className={styles.orb}>
        <span className={`${styles.cloud} ${styles.cloudOne}`} />
        <span className={`${styles.cloud} ${styles.cloudTwo}`} />
        <span className={`${styles.cloud} ${styles.cloudThree}`} />
        <span className={styles.horizon} />
        <span className={styles.glass} />
      </div>
      
    </div>
  );
}
