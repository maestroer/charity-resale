import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LEGAL_LINKS } from '@/components/PageLayout';
import type { BlockId } from '@/types';
import { to } from '@/lib/url';

type Props = {
    siteName: string;
    onGo: (id: BlockId) => void;
};

const LINKS: { id: BlockId; label: string }[] = [
    { id: 'veshi', label: 'Вещи' },
    { id: 'istoriya', label: 'История' },
    { id: 'fond', label: 'Фонд' },
];

/** Бургер в бирюзовом блоке и панель меню, выезжающая слева на всю высоту экрана. */
export function Menu({ siteName, onGo }: Props) {
    const [open, setOpen] = useState(false);
    const burger = useRef<HTMLButtonElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        closeButton.current?.focus({ preventScroll: true });

        // Перехват на фазе capture: Esc закрывает только меню, раскрытый блок сетки остаётся.
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopImmediatePropagation();
                setOpen(false);
                burger.current?.focus();
            }
        };

        window.addEventListener('keydown', onKey, true);

        return () => window.removeEventListener('keydown', onKey, true);
    }, [open]);

    const close = () => {
        setOpen(false);
        burger.current?.focus();
    };

    return (
        <>
            <button
                ref={burger}
                type="button"
                className="burger"
                aria-label="Меню"
                aria-expanded={open}
                aria-controls="menu"
                onClick={() => setOpen(true)}
            >
                <i />
                <i />
                <i />
            </button>
            {/* Портал в body: блоки сетки обрезают содержимое и получают transform на время анимации. */}
            {createPortal(
                <>
            <div className="menu-overlay" data-open={open || undefined} onClick={close} />
            <nav id="menu" className="menu" aria-label="Меню" data-open={open || undefined} inert={!open}>
                <div className="menu-head">
                    <span>{siteName}</span>
                    <button ref={closeButton} type="button" className="menu-close meta" onClick={close}>
                        Закрыть
                    </button>
                </div>
                <ul className="menu-links">
                    {LINKS.map(({ id, label }) => (
                        <li key={id}>
                            <a
                                href={to(`/?open=${id}`)}
                                onClick={(event) => {
                                    event.preventDefault();
                                    setOpen(false);
                                    onGo(id);
                                }}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                    {[{ href: '/fond', label: 'Отчёты фонда' }, ...LEGAL_LINKS].map(({ href, label }) => (
                        <li key={href}>
                            <Link href={to(href)}>{label}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
                </>,
                document.body,
            )}
        </>
    );
}
