import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { BlockId } from '@/types';

type Props = {
    id: BlockId;
    word: string;
    className: string;
    open: BlockId | null;
    ready: BlockId | null;
    onToggle: (id: BlockId) => void;
    /** Строки в закрытом блоке: живые данные из базы. */
    meta?: ReactNode;
    /** Декоративная колонка слева от панели (ленты в «Вещах»). */
    aside?: ReactNode;
    panelClassName?: string;
    children: ReactNode;
};

/**
 * Буквенный блок сетки. В закрытом состоянии кнопка занимает весь блок,
 * в раскрытом — остаётся заголовком над панелью.
 */
export function LetterBlock({ id, word, className, open, ready, onToggle, meta, aside, panelClassName, children }: Props) {
    const expanded = open === id;
    const isReady = ready === id;
    const panel = useRef<HTMLDivElement>(null);
    const [first, ...rest] = [...word];

    useEffect(() => {
        if (isReady) {
            panel.current?.focus({ preventScroll: true });
        }
    }, [isReady]);

    return (
        <section
            data-block={id}
            data-expanded={expanded || undefined}
            data-ready={isReady || undefined}
            data-has-aside={aside ? true : undefined}
            className={`block ${className}`}
        >
            <button
                type="button"
                className="block-head"
                aria-expanded={expanded}
                aria-controls={`panel-${id}`}
                onClick={() => onToggle(id)}
            >
                {/* Скринридер читает слово целиком, а не по буквам из анимированных span. */}
                <span className="sr-only">{word}</span>
                <span className="word" aria-hidden="true" style={{ '--n': rest.length } as CSSProperties}>
                    {first}
                    {rest.map((char, index) => (
                        <span key={index} style={{ '--i': index } as CSSProperties}>
                            {char}
                        </span>
                    ))}
                </span>
                {meta && <span className="block-meta">{meta}</span>}
            </button>
            {aside && (
                <div className="block-aside" aria-hidden="true" hidden={!expanded}>
                    {aside}
                </div>
            )}
            <div
                id={`panel-${id}`}
                ref={panel}
                className={`panel ${panelClassName ?? ''}`}
                tabIndex={-1}
                hidden={!expanded}
            >
                {children}
            </div>
        </section>
    );
}
