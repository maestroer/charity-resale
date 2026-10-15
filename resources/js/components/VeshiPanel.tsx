import { useState, type CSSProperties } from 'react';
import { ItemCard } from '@/components/ItemCard';
import type { Item, Project } from '@/types';

type Props = {
    items: Item[];
    projects: Project[];
    dropLabel: string;
};

export function VeshiPanel({ items, projects, dropLabel }: Props) {
    const [project, setProject] = useState<string | null>(null);
    const visible = project ? items.filter((item) => item.project?.slug === project) : items;

    return (
        <>
            <p className="meta" style={{ '--i': 0 } as CSSProperties}>
                {dropLabel}
            </p>
            {projects.length > 1 && (
                <ul className="chips filter" aria-label="Фильтр по проекту" style={{ '--i': 1 } as CSSProperties}>
                    <li>
                        <button type="button" className="chip" aria-pressed={project === null} onClick={() => setProject(null)}>
                            все
                        </button>
                    </li>
                    {projects.map(({ slug, title }) => (
                        <li key={slug}>
                            <button
                                type="button"
                                className="chip"
                                aria-pressed={project === slug}
                                onClick={() => setProject(slug)}
                            >
                                {title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="cards">
                {visible.map((item, index) => (
                    <ItemCard key={item.slug} item={item} index={index} />
                ))}
            </div>
        </>
    );
}
