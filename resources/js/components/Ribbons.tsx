import type { Item } from '@/types';

type Tile = { key: string; item: Item };

const MIN_TILES = 8;

/** Повторяет плитки, пока лента не станет длиннее блока, иначе в цикле будет видна пустота. */
function fill(tiles: Tile[]): Tile[] {
    if (tiles.length === 0) {
        return [];
    }

    const out: Tile[] = [];
    for (let i = 0; out.length < Math.max(MIN_TILES, tiles.length); i++) {
        const tile = tiles[i % tiles.length];
        out.push({ ...tile, key: `${tile.key}-${i}` });
    }

    return out;
}

function Track({ tiles, direction }: { tiles: Tile[]; direction: 'up' | 'down' }) {
    const filled = fill(tiles);

    return (
        <div className={`ribbon ribbon-${direction}`}>
            {/* Содержимое продублировано: сдвиг на −50% возвращает ленту в исходную точку без шва. */}
            <ul className="ribbon-track">
                {[...filled, ...filled].map((tile, index) => (
                    <li key={`${tile.key}-${index}`} className="ribbon-tile">
                        {tile.item.photos[0] ? (
                            <img src={tile.item.photos[0].thumb} alt="" loading="lazy" />
                        ) : (
                            <span>{tile.item.brand ?? tile.item.title}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Две бесконечные ленты из вещей, которые можно купить прямо сейчас: одна едет вверх, другая вниз.
 * Пока таких вещей нет, ленты показывают весь каталог, чтобы блок не пустовал.
 */
export function Ribbons({ items }: { items: Item[] }) {
    const forSale = items.filter((item) => !item.draft && !item.sold && item.price_rub !== null);
    const tiles: Tile[] = (forSale.length > 0 ? forSale : items).map((item) => ({ key: item.slug, item }));

    return (
        <div className="ribbons">
            <Track tiles={tiles} direction="up" />
            <Track tiles={[...tiles].reverse()} direction="down" />
        </div>
    );
}
