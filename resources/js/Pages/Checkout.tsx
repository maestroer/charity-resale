import { Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { rub } from '@/lib/format';
import type { Item, SharedProps } from '@/types';
import { to } from '@/lib/url';

type Props = {
    item: Item;
    test_mode: boolean;
};

type Fields = {
    item: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    payment_method: 'card' | 'sbp';
    consent: boolean;
};

export default function Checkout({ item, test_mode }: Props) {
    const { site } = usePage<SharedProps>().props;
    const form = useForm<Fields>({
        item: item.slug,
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        delivery_address: '',
        payment_method: 'card',
        consent: false,
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
        <PageLayout title="Оформление заказа">
            <h1 className="page-title">Оформление заказа</h1>

            <div className="checkout">
                <form className="checkout-form" onSubmit={submit} noValidate>
                    {errors.item && (
                        <p className="notice notice-error" role="alert">
                            {errors.item}
                        </p>
                    )}

                    <fieldset>
                        <legend>Контакты</legend>
                        {field('customer_name', 'Имя и фамилия', 'text', 'name')}
                        {field('customer_email', 'Email', 'email', 'email')}
                        {field('customer_phone', 'Телефон', 'tel', 'tel', '+7 900 000-00-00')}
                    </fieldset>

                    <fieldset>
                        <legend>Доставка</legend>
                        <label className="field">
                            <span>Адрес</span>
                            <textarea
                                name="delivery_address"
                                rows={3}
                                value={form.data.delivery_address}
                                onChange={(event) => {
                                    form.setData('delivery_address', event.target.value);
                                    form.clearErrors('delivery_address');
                                }}
                                autoComplete="street-address"
                                placeholder="Город, улица, дом, квартира, индекс"
                                aria-invalid={errors.delivery_address ? true : undefined}
                                required
                            />
                            {errors.delivery_address && <span className="field-error">{errors.delivery_address}</span>}
                        </label>
                    </fieldset>

                    <fieldset>
                        <legend>Оплата</legend>
                        <div className="choice">
                            {(
                                [
                                    ['card', 'Банковская карта'],
                                    ['sbp', 'СБП'],
                                ] as const
                            ).map(([value, label]) => (
                                <label key={value}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={value}
                                        checked={form.data.payment_method === value}
                                        onChange={() => form.setData('payment_method', value)}
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <label className="consent">
                        <input
                            type="checkbox"
                            checked={form.data.consent}
                            onChange={(event) => {
                                form.setData('consent', event.target.checked);
                                form.clearErrors('consent');
                            }}
                            aria-invalid={errors.consent ? true : undefined}
                        />
                        <span>
                            Принимаю <Link href={to('/oferta')}>оферту</Link> и согласен на{' '}
                            <Link href={to('/privacy')}>обработку персональных данных</Link>
                        </span>
                    </label>
                    {errors.consent && <span className="field-error">{errors.consent}</span>}

                    {test_mode && (
                        <p className="notice">Тестовый режим: оплата не подключена, деньги не списываются.</p>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={form.processing}>
                        {form.processing ? 'Отправляем…' : `Оплатить ${item.price_rub !== null ? rub(item.price_rub) : ''}`}
                    </button>
                </form>

                <aside className="summary" aria-label="Ваш заказ">
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
                    <p className="meta">Вещь будет закреплена за вами на 15 минут после нажатия «Оплатить».</p>
                </aside>
            </div>
        </PageLayout>
    );
}
