import type { Item, Project } from '@/types';

type Tile = { key: string; kind: 'item'; item: Item } | { key: string; kind: 'project'; project: Project };

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
                    <li key={`${tile.key}-${index}`} className="ribbon-tile" data-kind={tile.kind}>
                        {tile.kind === 'project' ? (
                            <span>{tile.project.title}</span>
                        ) : tile.item.photos[0] ? (
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

/** Две бесконечные ленты: превью вещей едут вверх, вперемешку с проектами — вниз. */
export function Ribbons({ items, projects }: { items: Item[]; projects: Project[] }) {
    const itemTiles: Tile[] = items.map((item) => ({ key: item.slug, kind: 'item', item }));
    const mixed: Tile[] = [...itemTiles].reverse().flatMap((tile, index) => {
        const project = projects[index % Math.max(projects.length, 1)];

        return project ? [{ key: `p-${project.slug}-${index}`, kind: 'project', project } as Tile, tile] : [tile];
    });

    return (
        <div className="ribbons">
            <Track tiles={itemTiles} direction="up" />
            <Track tiles={mixed} direction="down" />
        </div>
    );
}
