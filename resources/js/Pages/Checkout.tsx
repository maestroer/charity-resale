import { Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { rub } from '@/lib/format';
import type { Item, SharedProps } from '@/types';
import { to } from '@/lib/url';

type Props = {
    item: Item;
};

type Fields = {
    item: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    accept_offer: boolean;
    consent_pd: boolean;
};

/** Заявка на покупку: оплаты на сайте нет, администратор связывается с покупателем сам. */
export default function Checkout({ item }: Props) {
    const { site } = usePage<SharedProps>().props;
    const form = useForm<Fields>({
        item: item.slug,
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        delivery_address: '',
        accept_offer: false,
        consent_pd: false,
    });
    const errors = form.errors as Partial<Record<keyof Fields, string>>;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(to('/checkout'), { preserveScroll: true });
    };

    const field = (name: 'customer_name' | 'customer_email' | 'customer_phone', label: string, type: string, autoComplete: string, placeholder?: string) => (
        <label className="field">
            <span>{label}</span>
            <input
                type={type}
                name={name}
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

    return (
        <PageLayout title="Заявка на покупку">
            <h1 className="page-title">Заявка на покупку</h1>
            <p className="page-lead">
                Оставьте контакты и адрес — мы свяжемся с вами в течение дня, договоримся об оплате и отправим вещь СДЭК.
            </p>

            <div className="checkout">
                <form className="checkout-form" onSubmit={submit} noValidate>
                    {errors.item && (
                        <p className="notice notice-error" role="alert">
                            {errors.item}
                        </p>
                    )}

                    <fieldset>
                        <legend>Контакты</legend>
                        {field('customer_name', 'ФИО', 'text', 'name')}
                        {field('customer_email', 'Email', 'email', 'email')}
                        {field('customer_phone', 'Телефон', 'tel', 'tel', '+7 900 000-00-00')}
                    </fieldset>

                    <fieldset>
                        <legend>Доставка СДЭК</legend>
                        <label className="field">
                            <span>Куда отправить</span>
                            <textarea
                                name="delivery_address"
                                rows={3}
                                value={form.data.delivery_address}
                                onChange={(event) => {
                                    form.setData('delivery_address', event.target.value);
                                    form.clearErrors('delivery_address');
                                }}
                                autoComplete="street-address"
                                placeholder="Город и адрес пункта СДЭК или ваш адрес для курьера"
                                aria-invalid={errors.delivery_address ? true : undefined}
                                required
                            />
                            {errors.delivery_address && <span className="field-error">{errors.delivery_address}</span>}
                        </label>
                    </fieldset>

                    {/* Два отдельных согласия: согласие на обработку персональных данных по закону не объединяется с офертой. */}
                    <label className="consent">
                        <input
                            type="checkbox"
                            checked={form.data.accept_offer}
                            onChange={(event) => {
                                form.setData('accept_offer', event.target.checked);
                                form.clearErrors('accept_offer');
                            }}
                            aria-invalid={errors.accept_offer ? true : undefined}
                        />
                        <span>
                            Принимаю условия <Link href={to('/oferta')}>публичной оферты</Link> и{' '}
                            <Link href={to('/dostavka-i-vozvrat')}>доставки и возврата</Link>
                        </span>
                    </label>
                    {errors.accept_offer && <span className="field-error">{errors.accept_offer}</span>}

                    <label className="consent">
                        <input
                            type="checkbox"
                            checked={form.data.consent_pd}
                            onChange={(event) => {
                                form.setData('consent_pd', event.target.checked);
                                form.clearErrors('consent_pd');
                            }}
                            aria-invalid={errors.consent_pd ? true : undefined}
                        />
                        <span>
                            Даю <Link href={to('/soglasie')}>согласие на обработку персональных данных</Link> на условиях{' '}
                            <Link href={to('/privacy')}>политики</Link>
                        </span>
                    </label>
                    {errors.consent_pd && <span className="field-error">{errors.consent_pd}</span>}

                    <button type="submit" className="btn btn-primary" disabled={form.processing}>
                        {form.processing ? 'Отправляем…' : 'Отправить заявку'}
                    </button>
                </form>

                <aside className="summary" aria-label="Ваша заявка">
                    <div className="card-photo">
                        {item.photos[0] ? <img src={item.photos[0].thumb} alt={item.photos[0].alt} /> : <span className="meta">{item.brand ?? 'фото скоро'}</span>}
                    </div>
                    <h2 className="card-title">{item.title}</h2>
                    <p className="card-details">{[item.project?.title, item.size].filter(Boolean).join(' · ')}</p>
                    {item.price_rub !== null && item.fund_rub !== null && (
                        <dl className="summary-rows">
                            <div>
                                <dt>Стоимость</dt>
                                <dd>{rub(item.price_rub)}</dd>
                            </div>
                            <div className="summary-fund">
                                <dt>Из них в фонд {site.fund_name}</dt>
                                <dd>{rub(item.fund_rub)}</dd>
                            </div>
                        </dl>
                    )}
                    <p className="meta">Вещь закрепляется за вами сразу после заявки. Оплата — после звонка, переводом или по СБП.</p>
                </aside>
            </div>
        </PageLayout>
    );
}
