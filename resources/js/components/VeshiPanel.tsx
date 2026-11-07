import { useState, type CSSProperties } from 'react';
import { ItemCard } from '@/components/ItemCard';
import { OWNER_CATEGORIES } from '@/content/owners';
import type { Item } from '@/types';

type Props = {
    items: Item[];
    dropLabel: string;
};

/** Каталог всех вещей проекта с фильтром по тому, чьи это вещи. */
export function VeshiPanel({ items, dropLabel }: Props) {
    const [category, setCategory] = useState<string | null>(null);
    const visible = category ? items.filter((item) => item.owner.category === category) : items;

    return (
        <>
            <p className="meta" style={{ '--i': 0 } as CSSProperties}>
                {dropLabel}
            </p>
            <ul className="chips filter" aria-label="Чьи вещи" style={{ '--i': 1 } as CSSProperties}>
                <li>
                    <button type="button" className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>
                        все
                    </button>
                </li>
                {OWNER_CATEGORIES.map(({ value, label }) => (
                    <li key={value}>
                        <button type="button" className="chip" aria-pressed={category === value} onClick={() => setCategory(value)}>
                            {label}
                        </button>
                    </li>
                ))}
            </ul>
            {visible.length === 0 ? (
                <p className="cards-empty">Здесь пока нет вещей. Загляните в другие разделы.</p>
            ) : (
                <div className="cards">
                    {visible.map((item, index) => (
                        <ItemCard key={item.slug} item={item} index={index} />
                    ))}
                </div>
            )}
        </>
    );
}
