import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { plural, rub } from '@/lib/format';
import { useCountUp } from '@/lib/useCountUp';
import type { Site, Stats } from '@/types';
import { to } from '@/lib/url';

type Props = {
    site: Site;
    stats: Stats;
    active: boolean;
    /** Ч/б фото для мозаики. Пока их нет, плитки — цветные заглушки. */
    photos?: string[];
};

const TILE_PX = 96;
// Заглушки берут цвета палитры: под grayscale они дают разные тона серого, при наведении — цвет.
const PLACEHOLDER_COLORS = ['var(--color-blue)', 'var(--color-yellow)', 'var(--color-teal)', 'var(--color-ink)', 'var(--color-paper)', 'var(--color-pink)'];

export function FondPanel({ site, stats, active, photos = [] }: Props) {
    const mosaic = useRef<HTMLDivElement>(null);
    const [grid, setGrid] = useState({ cols: 0, rows: 0, visibleRows: 0 });
    const total = useCountUp(stats.fund_total_rub, active);

    useEffect(() => {
        const element = mosaic.current;
        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width === 0 || height === 0) {
                return;
            }

            const cols = Math.max(3, Math.round(width / TILE_PX));
            const tile = width / cols;
            const rows = Math.ceil(height / tile);
            const visibleRows = Math.max(2, Math.floor(height / tile));
            setGrid((prev) => (prev.cols === cols && prev.rows === rows ? prev : { cols, rows, visibleRows }));
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const { cols, rows, visibleRows } = grid;
    // Значок проекта — мини-сетка 2×2 — занимает четыре ячейки в центре видимой части мозаики.
    const logoCol = Math.floor((cols - 2) / 2);
    const logoRow = Math.floor((visibleRows - 2) / 2);
    const tiles: { col: number; row: number }[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const underLogo = col >= logoCol && col < logoCol + 2 && row >= logoRow && row < logoRow + 2;
            if (!underLogo) {
                tiles.push({ col, row });
            }
        }
    }

    return (
        <>
            <div ref={mosaic} className="mosaic" style={{ '--cols': cols || 1 } as CSSProperties}>
                {tiles.map(({ col, row }, index) => {
                    // Волна от центра: задержка растёт с расстоянием до значка.
                    const distance = Math.round(Math.hypot(col - (logoCol + 0.5), row - (logoRow + 0.5)));
                    const photo = photos.length ? photos[index % photos.length] : null;

                    return (
                        <div
                            key={`${col}-${row}`}
                            className="mosaic-tile"
                            style={{
                                '--d': distance,
                                gridColumn: col + 1,
                                gridRow: row + 1,
                                background: photo ? undefined : PLACEHOLDER_COLORS[(col * 7 + row * 3) % PLACEHOLDER_COLORS.length],
                            } as CSSProperties}
                        >
                            {photo && <img src={photo} alt="" loading="lazy" />}
                        </div>
                    );
                })}
                {cols > 0 && (
                    <div
                        className="mosaic-logo"
                        aria-hidden="true"
                        style={{ gridColumn: `${logoCol + 1} / span 2`, gridRow: `${logoRow + 1} / span 2` }}
                    >
                        <span className="bg-paper">В</span>
                        <span className="bg-blue">И</span>
                        <span className="bg-yellow" />
                        <span className="bg-pink">Ф</span>
                    </div>
                )}
            </div>
            <div className="fund-card">
                <p className="meta">{site.fund_name}</p>
                <p className="fund-label">Уже собрано</p>
                <p className="fund-total">{rub(total)}</p>
                <p className="meta">
                    Продано: {stats.sold_count} {plural(stats.sold_count, ['вещь', 'вещи', 'вещей'])}
                </p>
                <Link href={to('/fond')} className="btn btn-primary fund-card-action">
                    Все отчёты
                </Link>
            </div>
        </>
    );
}
