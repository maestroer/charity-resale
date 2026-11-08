import { Link } from '@inertiajs/react';
import { useState, type CSSProperties } from 'react';
import { InvestorPanel } from '@/components/InvestorPanel';
import type { BlockId } from '@/types';
import { MONEY_SPLIT } from '@/content/money';
import { to } from '@/lib/url';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** Блок «Инвестиции»: цели проекта и то, куда идут деньги от каждой покупки. */
export function IstoriyaPanel({ onGo }: { onGo: (id: BlockId) => void }) {
    // Вкладки блока: «О проекте» — цели и как это работает, «Инвестору» — всё для инвесторов.
    const [tab, setTab] = useState<'about' | 'investor'>('about');
    const steps = [
        'Блогер, актёр, певец или артист передаёт свою вещь в продажу.',
        'Мы снимаем её и записываем историю: где и когда её носили, использовали, показывали.',
        'Вещи выходят дропом — анонс в наших соцсетях и соцсетях владельца вещи.',
        'Вы оставляете заявку или делаете ставку в аукционе — мы звоним, договариваемся об оплате и отправляем вещь СДЭК.',
        '30% стоимости уходит в благотворительный фонд, 40% — на существование проекта и 30% — на специальный счёт, с которого потом проект сможет инвестировать в фонды и стартапы.',
    ];

    const tabs = (
        <div className="invest-tabs" role="tablist" aria-label="Разделы блока «Инвестиции»">
            {(
                [
                    ['about', 'О проекте'],
                    ['investor', 'Инвестору'],
                ] as const
            ).map(([value, label]) => (
                <button key={value} type="button" role="tab" className="chip" aria-selected={tab === value} onClick={() => setTab(value)}>
                    {label}
                </button>
            ))}
        </div>
    );

    if (tab === 'investor') {
        return (
            <>
                {tabs}
                <InvestorPanel />
            </>
        );
    }

    return (
        <>
            {tabs}
            <p className="lead" style={step(0)}>
                ВИФ — это вещи известных людей: блогеров, актёров, певцов, артистов и инфлюенсеров. Здесь их можно купить и
                носить, оставить в коллекцию или для любой другой цели. У каждой вещи есть история — где и когда её видели
                зрители и подписчики, что именно она значила и какую ценность несёт.
            </p>
            <p className="lead" style={step(1)}>
                Каждая покупка помогает. Доля фонда известна заранее и одинакова для всех вещей, а сумма в рублях
                указана на каждой карточке.
            </p>
            <div className="info-cards" style={step(2)}>
                <section className="info-card">
                    <h3>Как это работает</h3>
                    <ol>
                        {steps.map((text) => (
                            <li key={text}>{text}</li>
                        ))}
                    </ol>
                </section>
                <section className="info-card">
                    <h3>Куда идут деньги</h3>
                    <dl className="split">
                        {MONEY_SPLIT.map(({ share, text }) => (
                            <div key={text}>
                                <dt>{share}</dt>
                                <dd>{text}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="split-note">По каждому переводу в фонд публикуем отчёт с платёжкой.</p>
                </section>
            </div>
            <div className="actions" style={step(3)}>
                <button type="button" className="btn btn-primary" onClick={() => onGo('veshi')}>
                    Смотреть вещи
                </button>
                <Link href={to('/fond')} className="btn btn-secondary">
                    Отчёты фонда
                </Link>
            </div>
        </>
    );
}
