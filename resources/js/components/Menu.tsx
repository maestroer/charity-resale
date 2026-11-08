import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { LEGAL_LINKS } from '@/components/PageLayout';
import { INVESTOR } from '@/content/investor';
import type { BlockId } from '@/types';
import { to } from '@/lib/url';

type Props = {
    open: BlockId | null;
    ready: BlockId | null;
    onGo: (id: BlockId | null) => void;
};

const LINKS: { id: BlockId; label: string }[] = [
    { id: 'veshi', label: 'Вещи' },
    { id: 'istoriya', label: 'Инвестиции' },
    { id: 'fond', label: 'Фонд' },
];

/**
 * Меню как на dvc.ai: бирюзовый блок раскрывается в сетке так же, как остальные блоки (/?open=menu),
 * бургер превращается в крестик, а ссылки проявляются, когда блок встал на место.
 */
export function Menu({ open, ready, onGo }: Props) {
    const expanded = open === 'menu';
    const isReady = ready === 'menu';
    const nav = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isReady) {
            nav.current?.focus({ preventScroll: true });
        }
    }, [isReady]);

    const links = [{ href: '/fond', label: 'Отчёты фонда' }, ...LEGAL_LINKS];
    let index = 0;

    return (
        <>
            <button
                type="button"
                className="menu-toggle"
                aria-expanded={expanded}
                aria-controls="menu"
                aria-label={expanded ? 'Закрыть меню' : 'Открыть меню'}
                onClick={() => onGo(expanded ? null : 'menu')}
            >
                <span className="menu-toggle-label">Меню</span>
                <span className="burger" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                </span>
            </button>
            <nav id="menu" ref={nav} className="menu-nav" aria-label="Меню" tabIndex={-1} hidden={!expanded}>
                <ul className="menu-links">
                    {LINKS.map(({ id, label }) => (
                        <li key={id} style={{ '--i': index++ } as React.CSSProperties}>
                            <a
                                href={to(`/?open=${id}`)}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onGo(id);
                                }}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                    {links.map(({ href, label }) => (
                        <li key={href} style={{ '--i': index++ } as React.CSSProperties}>
                            <Link href={to(href)}>{label}</Link>
                        </li>
                    ))}
                </ul>
                <p className="menu-contacts meta" style={{ '--i': index } as React.CSSProperties}>
                    <a href={`mailto:${INVESTOR.contact.email}`}>{INVESTOR.contact.email}</a>
                    <a href={INVESTOR.contact.telegram} target="_blank" rel="noreferrer">
                        Telegram
                    </a>
                </p>
            </nav>
        </>
    );
}
