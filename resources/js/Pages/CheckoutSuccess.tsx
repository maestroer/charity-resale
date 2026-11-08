import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { reachGoal } from '@/lib/metrika';
import { rub } from '@/lib/format';
import type { SharedProps } from '@/types';
import { to } from '@/lib/url';

type Props = {
    order: {
        number: string;
        item_title: string;
        price_rub: number;
        fund_rub: number;
        test: boolean;
    };
};

/** Заявка принята: дальше администратор звонит покупателю. */
export default function CheckoutSuccess({ order }: Props) {
    const { site } = usePage<SharedProps>().props;

    useEffect(() => {
        if (!order.test) {
            reachGoal('request', { order_price: order.price_rub });
        }
    }, [order.test, order.price_rub]);

    return (
        <PageLayout title="Заявка принята">
            <h1 className="page-title">Заявка принята</h1>
            <p className="page-lead">
                Вещь закреплена за вами. Мы свяжемся с вами в течение дня, договоримся об оплате и отправим вещь СДЭК. После оплаты{' '}
                {rub(order.fund_rub)} уйдут в {site.fund_name}, отчёт опубликуем после перевода.
            </p>
            {order.test && <p className="notice">Демо-режим: заявка тестовая, с вами никто не свяжется.</p>}

            <dl className="summary-rows summary-rows-wide">
                <div>
                    <dt>Заявка</dt>
                    <dd>{order.number}</dd>
                </div>
                <div>
                    <dt>{order.item_title}</dt>
                    <dd>{rub(order.price_rub)}</dd>
                </div>
            </dl>

            <div className="actions">
                <Link href={to('/?open=veshi')} className="btn btn-primary">
                    В каталог
                </Link>
                <Link href={to('/fond')} className="btn btn-secondary">
                    Отчёты фонда
                </Link>
            </div>
        </PageLayout>
    );
}
