import { FOUNDER } from '@/content/founder';

/** Кто стоит за проектом: у фонда появляется лицо, а у инвестора — ответ на вопрос «почему вы». */
export function FounderCard() {
    return (
        <section className="founder-card" aria-labelledby="founder-name">
            <p className="meta">Кто за проектом</p>
            <div className="founder-head">
                <span className="founder-avatar" aria-hidden="true">
                    {FOUNDER.initials}
                </span>
                <div>
                    <h3 id="founder-name" className="founder-name">
                        {FOUNDER.name}
                    </h3>
                    <p className="founder-role">{FOUNDER.role}</p>
                </div>
            </div>
            {FOUNDER.why.map((text) => (
                <p key={text} className="founder-why">
                    {text}
                </p>
            ))}
            <dl className="founder-facts">
                {FOUNDER.facts.map(({ value, label }) => (
                    <div key={label}>
                        <dt>{value}</dt>
                        <dd className="meta">{label}</dd>
                    </div>
                ))}
            </dl>
            <p className="founder-links">
                {FOUNDER.links.map(({ label, href }) => (
                    <a key={href} href={href} target="_blank" rel="noopener">
                        {label} ↗
                    </a>
                ))}
            </p>
        </section>
    );
}
