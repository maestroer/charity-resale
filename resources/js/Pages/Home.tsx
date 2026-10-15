import { Head, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { DemoBadge } from '@/components/DemoBadge';
import { FondPanel } from '@/components/FondPanel';
import { IstoriyaPanel } from '@/components/IstoriyaPanel';
import { ItemPanel } from '@/components/ItemPanel';
import { LetterBlock } from '@/components/LetterBlock';
import { Menu } from '@/components/Menu';
import { Ribbons } from '@/components/Ribbons';
import { Terminal } from '@/components/Terminal';
import { VeshiPanel } from '@/components/VeshiPanel';
import { plural, rub } from '@/lib/format';
import { useGridState } from '@/lib/useGridState';
import type { Item, ItemDetail, Project, SharedProps, Stats } from '@/types';

type Props = {
    items: Item[];
    projects: Project[];
    stats: Stats;
    item: ItemDetail | null;
};

export default function Home({ items, projects, stats, item }: Props) {
    const { site } = usePage<SharedProps>().props;
    const stage = useRef<HTMLElement>(null);
    const { open, ready, lift, toggle, go } = useGridState(stage);
    const onSale = items.filter((item) => !item.draft && !item.sold);

    return (
        <>
            <Head title={site.name} />
            <main ref={stage} className="stage" data-open={open ?? ''} data-lift={lift ?? ''}>
                <LetterBlock
                    id="veshi"
                    word="Вещи"
                    className="block-v"
                    open={open}
                    ready={ready}
                    onToggle={toggle}
                    aside={<Ribbons items={items} projects={projects} />}
                    meta={
                        <>
                            {onSale.slice(0, 3).map((item) => (
                                <span key={item.slug}>
                                    {item.title} — {item.price_rub !== null && rub(item.price_rub)}
                                </span>
                            ))}
                            <span>
                                {stats.items_count} {plural(stats.items_count, ['вещь', 'вещи', 'вещей'])} · {site.drop_label}
                            </span>
                        </>
                    }
                >
                    <VeshiPanel items={items} projects={projects} dropLabel={site.drop_label} />
                </LetterBlock>

                <LetterBlock
                    id="istoriya"
                    word="История"
                    className="block-i"
                    open={open}
                    ready={ready}
                    onToggle={toggle}
                    meta={<span>30% стоимости каждой вещи — в фонд</span>}
                >
                    <IstoriyaPanel site={site} onGo={go} />
                </LetterBlock>

                <section data-block="sprosit" className="block block-s" aria-label="Спросить о вещах">
                    <Terminal context={{ items, stats, site }} />
                </section>

                <div data-block="slogan" className="block block-d">
                    <p className="slogan">
                        <span>Носить</span>
                        <span>Помнить</span>
                        <span>Помогать</span>
                    </p>
                </div>

                <LetterBlock
                    id="fond"
                    word="Фонд"
                    className="block-f"
                    panelClassName="panel-fond"
                    open={open}
                    ready={ready}
                    onToggle={toggle}
                    meta={
                        <>
                            <span>{site.fund_name}</span>
                            <span>Уже собрано — {rub(stats.fund_total_rub)}</span>
                        </>
                    }
                >
                    <FondPanel site={site} stats={stats} active={ready === 'fond'} />
                </LetterBlock>

                <header data-block="title" className="block block-t">
                    <p className="site-name">{site.name}</p>
                    <Menu siteName={site.name} onGo={go} />
                </header>
            </main>
            <ItemPanel item={item} />
            <DemoBadge />
        </>
    );
}
