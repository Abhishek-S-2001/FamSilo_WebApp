'use client';

import { useRef, useCallback } from 'react';
import styles from './MediaCard.module.css';

interface MediaCardProps {
  children: React.ReactNode;
  maxTilt?: number; // degrees, default 8
}

/**
 * MediaCard — applies a 3D perspective tilt effect on hover.
 * The JS only writes CSS custom properties on mousemove;
 * all rendering is done by the CSS Module (no JS per-frame reflows).
 */
export default function MediaCard({ children, maxTilt = 8 }: MediaCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Normalise cursor position to [-1, 1] within the card
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    el.style.setProperty('--rx', String((-yPct * maxTilt).toFixed(2)));
    el.style.setProperty('--ry', String((xPct * maxTilt).toFixed(2)));

    // Glare position (0-100% percentage space)
    el.style.setProperty('--glare-x', String(((xPct + 1) / 2 * 100).toFixed(1)));
    el.style.setProperty('--glare-y', String(((yPct + 1) / 2 * 100).toFixed(1)));
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0');
    el.style.setProperty('--ry', '0');
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.inner}>
        {children}
      </div>
      <div className={styles.glare} aria-hidden="true" />
    </div>
  );
}
