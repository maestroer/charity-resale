import { useEffect, useState } from 'react';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Пересчитывает число от 0 до `value`, пока `active`. Без анимации при prefers-reduced-motion. */
export function useCountUp(value: number, active: boolean, durationMs = 1200): number {
    const [shown, setShown] = useState(active ? value : 0);

    useEffect(() => {
        if (!active) {
            setShown(0);

            return;
        }

        if (value === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setShown(value);

            return;
        }

        let frame = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            setShown(Math.round(value * easeOutCubic(progress)));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [value, active, durationMs]);

    return shown;
}
