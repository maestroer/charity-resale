import { FOUNDER } from '@/content/founder';

/** Руководитель проекта: у фонда появляется лицо, а у инвестора — понимание, кто за этим стоит. */
export function FounderCard() {
    return (
        <section className="founder-card" aria-labelledby="founder-name">
            <p className="meta">{FOUNDER.heading}</p>
            <div className="founder-head">
                <img className="founder-photo" src={FOUNDER.photo} alt={FOUNDER.name} width="96" height="128" loading="lazy" />
                <div>
                    <h3 id="founder-name" className="founder-name">
                        {FOUNDER.name}
                    </h3>
                    <p className="founder-role">{FOUNDER.role}</p>
                    <p className="founder-background">{FOUNDER.background}</p>
                </div>
            </div>
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
