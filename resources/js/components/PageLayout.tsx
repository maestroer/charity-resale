import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { DemoBadge } from '@/components/DemoBadge';
import type { SharedProps } from '@/types';
import { to } from '@/lib/url';

export const LEGAL_LINKS = [
    { href: '/dostavka-i-vozvrat', label: 'Доставка и возврат' },
    { href: '/oferta', label: 'Оферта' },
    { href: '/privacy', label: 'Персональные данные' },
];

/** Простая страница на белом: шапка с названием, содержимое, подвал со ссылками. */
export function PageLayout({ title, children }: { title: string; children: ReactNode }) {
    const { site } = usePage<SharedProps>().props;

    return (
        <div className="page">
            <Head title={`${title} — ${site.name}`} />
            <header className="page-head">
                <Link href={to('/')} className="site-name">
                    {site.name}
                </Link>
                <nav className="page-nav" aria-label="Разделы">
                    <Link href={to('/?open=veshi')}>Вещи</Link>
                    <Link href={to('/fond')}>Фонд</Link>
                </nav>
            </header>
            <main className="page-main">{children}</main>
            <footer className="page-foot meta">
                {LEGAL_LINKS.map(({ href, label }) => (
                    <Link key={href} href={to(href)}>
                        {label}
                    </Link>
                ))}
            </footer>
            <DemoBadge />
        </div>
    );
}
