import { memo, useState, useEffect } from 'react';

/**
 * Animated number counter.
 * Wrapped with React.memo to avoid re-animating when sibling components change.
 */
export const AnimatedCounter = memo(({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalFrames = Math.round(duration * 60);
    const increment = end / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{typeof value === 'number' && value % 1 !== 0 ? count.toFixed(1) : count}</span>;
});

AnimatedCounter.displayName = 'AnimatedCounter';
