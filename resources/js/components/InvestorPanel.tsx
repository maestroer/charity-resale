import { INVESTOR } from '@/content/investor';
import { MONEY_SPLIT } from '@/content/money';

/** Вкладка «Инвестору»: модель денег, стадия, форматы участия и контакт руководителя. */
export function InvestorPanel() {
    return (
        <article className="investor" aria-label="Инвестору">
            <p className="meta">Инвестору</p>
            <h3 className="investor-title">{INVESTOR.title}</h3>
            <p className="investor-lead">{INVESTOR.pitch}</p>

            <section>
                <h4>Куда идут деньги от каждой продажи</h4>
                <dl className="split">
                    {MONEY_SPLIT.map(({ share, text }) => (
                        <div key={text}>
                            <dt>{share}</dt>
                            <dd>{text}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section>
                <h4>Почему это работает</h4>
                <ul>
                    {INVESTOR.why.map((text) => (
                        <li key={text}>{text}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h4>Стадия</h4>
                <p>{INVESTOR.stage}</p>
            </section>

            <section>
                <h4>На что пойдут инвестиции</h4>
                <ul>
                    {INVESTOR.uses.map((text) => (
                        <li key={text}>{text}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h4>Форматы участия</h4>
                <div className="investor-formats">
                    {INVESTOR.formats.map(({ title, text }) => (
                        <div key={title} className="investor-format">
                            <p className="investor-format-title">{title}</p>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
                <p>{INVESTOR.terms}</p>
            </section>

            <section>
                <h4>Отчётность</h4>
                <p>{INVESTOR.reporting}</p>
            </section>

            <div className="actions">
                <a className="btn btn-primary" href={INVESTOR.contact.telegram} target="_blank" rel="noopener">
                    Написать в Telegram
                </a>
                <a className="btn btn-secondary" href={`mailto:${INVESTOR.contact.email}`}>
                    {INVESTOR.contact.email}
                </a>
            </div>

            <p className="investor-disclaimer">{INVESTOR.disclaimer}</p>
        </article>
    );
}
