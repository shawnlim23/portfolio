import { Children, useMemo } from 'react';
import type { ReactNode } from 'react';

type ScatterFieldProps = {
  children: ReactNode | ReactNode[];
  seed?: number;
};

// Deterministic pseudo-random placement so SSR and client markup match.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ScatterField({ children, seed = 1 }: ScatterFieldProps) {
  const items = Children.toArray(children);

  const positions = useMemo(() => {
    const rand = mulberry32(seed);
    return items.map(() => ({
      top: `${Math.floor(rand() * 80)}%`,
      left: `${Math.floor(rand() * 80)}%`,
      rotate: `${Math.floor(rand() * 16) - 8}deg`,
    }));
  }, [items.length, seed]);

  return (
    <div className="scatter-field">
      {items.map((child, i) => (
        <div
          key={i}
          className="scatter-item"
          style={{ position: 'absolute', top: positions[i].top, left: positions[i].left, transform: `rotate(${positions[i].rotate})` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
