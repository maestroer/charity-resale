import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { rub } from '@/lib/format';
import { IS_DEMO, to } from '@/lib/url';
import type { Auction, SharedProps } from '@/types';

type Fields = {
    amount_rub: string;
    name: string;
    phone: string;
    email: string;
    accept_offer: boolean;
    consent_pd: boolean;
};

/** Сколько осталось до конца торгов: «2 д 4 ч», «3 ч 12 мин», «4:05». */
function left(ms: number): string {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);

    if (d > 0) {
        return `${d} д ${h} ч`;
    }

    if (h > 0) {
        return `${h} ч ${m} мин`;
    }

    return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function useNow(active: boolean): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!active) {
            return;
        }

        const timer = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(timer);
    }, [active]);

    return now;
}

/** Аукцион в карточке вещи: текущая ставка, таймер и форма ставки. */
export function AuctionBox({ slug, auction, fundRub, sold }: { slug: string; auction: Auction; fundRub: number | null; sold: boolean }) {
    const { flash, site } = usePage<SharedProps>().props;
    const manager = site?.manager_telegram;
    const endsAt = auction.ends_at ? Date.parse(auction.ends_at) : null;
    const now = useNow(auction.open);
    const open = auction.open && endsAt !== null && endsAt > now;
    const form = useForm<Fields>({
        amount_rub: String(auction.min_bid_rub),
        name: '',
        phone: '',
        email: '',
        accept_offer: false,
        consent_pd: false,
    });
    const errors = form.errors as Partial<Record<keyof Fields, string>>;

    // После каждой ставки минимальная ставка растёт — подставляем новую.
    useEffect(() => {
        form.setData('amount_rub', String(auction.min_bid_rub));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auction.min_bid_rub]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(to(`/veshi/${slug}/bids`), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => form.reset('accept_offer', 'consent_pd'),
        });
    };

    const text = (name: 'name' | 'phone' | 'email', label: string, type: string, autoComplete: string, placeholder?: string) => (
        <label className="field">
            <span>{label}</span>
            <input
                type={type}
                value={form.data[name]}
                onChange={(event) => {
                    form.setData(name, event.target.value);
                    form.clearErrors(name);
                }}
                autoComplete={autoComplete}
                placeholder={placeholder}
                aria-invalid={errors[name] ? true : undefined}
                required
            />
            {errors[name] && <span className="field-error">{errors[name]}</span>}
        </label>
    );

    const consent = (name: 'accept_offer' | 'consent_pd', children: ReactNode) => (
        <>
            <label className="consent">
                <input
                    type="checkbox"
                    checked={form.data[name]}
                    onChange={(event) => {
                        form.setData(name, event.target.checked);
                        form.clearErrors(name);
                    }}
                    aria-invalid={errors[name] ? true : undefined}
                />
                <span>{children}</span>
            </label>
            {errors[name] && <span className="field-error">{errors[name]}</span>}
        </>
    );

    return (
        <section className="auction" aria-label="Аукцион">
            <p className="meta">Аукцион</p>
            <dl className="auction-rows">
                <div>
                    <dt>{auction.current_rub === null ? 'Стартовая цена' : 'Текущая ставка'}</dt>
                    <dd className="item-price">{rub(auction.current_rub ?? auction.start_rub)}</dd>
                </div>
                <div>
                    <dt>Ставок</dt>
                    <dd>{auction.bids_count}</dd>
                </div>
                <div>
                    <dt>{open ? 'До конца' : 'Торги'}</dt>
                    <dd>{open && endsAt !== null ? left(endsAt - now) : sold ? 'вещь продана' : 'завершены'}</dd>
                </div>
            </dl>
            {fundRub !== null && <p className="card-fund">из них в фонд — {rub(fundRub)}</p>}

            {flash.bid_placed && (
                <p className="notice" role="status">
                    Ставка принята. Если её перебьют, торги продолжатся; победителю мы напишем и позвоним после окончания.
                </p>
            )}

            {/* Если указан менеджер, в демо вместо ставок кнопка «Написать менеджеру» под блоком. */}
            {open && IS_DEMO && !manager && <p className="notice">В демо-версии ставки не принимаются.</p>}

            {open && !IS_DEMO && (
                <form className="auction-form" onSubmit={submit} noValidate>
                    <label className="field">
                        <span>Ваша ставка, ₽ — минимум {rub(auction.min_bid_rub)}, шаг {rub(auction.step_rub)}</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={auction.min_bid_rub}
                            step={auction.step_rub || 1}
                            value={form.data.amount_rub}
                            onChange={(event) => {
                                form.setData('amount_rub', event.target.value);
                                form.clearErrors('amount_rub');
                            }}
                            aria-invalid={errors.amount_rub ? true : undefined}
                            required
                        />
                        {errors.amount_rub && <span className="field-error">{errors.amount_rub}</span>}
                    </label>
                    {text('name', 'ФИО', 'text', 'name')}
                    {text('phone', 'Телефон', 'tel', 'tel', '+7 900 000-00-00')}
                    {text('email', 'Email', 'email', 'email')}
                    {consent(
                        'accept_offer',
                        <>
                            Принимаю <Link href={to('/oferta')}>оферту и правила аукциона</Link>: моя ставка — обязательство купить вещь, если она
                            победит
                        </>,
                    )}
                    {consent(
                        'consent_pd',
                        <>
                            Даю <Link href={to('/soglasie')}>согласие на обработку персональных данных</Link> на условиях{' '}
                            <Link href={to('/privacy')}>политики</Link>
                        </>,
                    )}
                    <button type="submit" className="btn btn-primary" disabled={form.processing}>
                        {form.processing ? 'Отправляем…' : 'Сделать ставку'}
                    </button>
                    <p className="meta">Ставка в последние 5 минут продлевает торги ещё на 5 минут.</p>
                </form>
            )}
        </section>
    );
}
