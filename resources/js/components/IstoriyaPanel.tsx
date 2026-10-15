import { Link } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import type { BlockId, Site } from '@/types';
import { to } from '@/lib/url';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

export function IstoriyaPanel({ site, onGo }: { site: Site; onGo: (id: BlockId) => void }) {
    const steps = [
        'Вещь со съёмок передаётся в продажу.',
        'Мы снимаем её и записываем историю: проект, сцена, образ.',
        `Вещи выходят дропом — анонс в соцсетях ${site.actress}.`,
        'Вы покупаете онлайн, картой или по СБП.',
        '30% стоимости уходит в фонд, мы публикуем отчёт.',
    ];

    return (
        <>
            <p className="lead" style={step(0)}>
                Вещи со съёмок обычно остаются в костюмерных. Здесь их можно купить и носить: у каждой есть история —
                проект, сцена и образ, в котором её видели зрители.
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
                    <p>
                        30% стоимости каждой вещи уходит в фонд {site.fund_name}. По каждой продаже мы публикуем отчёт
                        с платёжкой.
                    </p>
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
