import { Link } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import type { BlockId } from '@/types';
import { to } from '@/lib/url';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** Как распределяется стоимость каждой проданной вещи. */
const SPLIT = [
    { share: '30%', text: 'в благотворительный фонд' },
    { share: '40%', text: 'на существование проекта' },
    { share: '30%', text: 'на специальный счёт, с которого проект будет инвестировать в фонды и стартапы' },
];

/** Блок «Инвестиции»: цели проекта и то, куда идут деньги от каждой покупки. */
export function IstoriyaPanel({ onGo }: { onGo: (id: BlockId) => void }) {
    const steps = [
        'Блогер, актёр, певец или артист передаёт свою вещь в продажу.',
        'Мы снимаем её и записываем историю: где и когда её носили, использовали, показывали.',
        'Вещи выходят дропом — анонс в наших соцсетях и соцсетях владельца вещи.',
        'Вы покупаете онлайн, картой или по СБП.',
        '30% стоимости уходит в благотворительный фонд, 40% — на существование проекта и 30% — на специальный счёт, с которого потом проект сможет инвестировать в фонды и стартапы.',
    ];

    return (
        <>
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
                        {SPLIT.map(({ share, text }) => (
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
