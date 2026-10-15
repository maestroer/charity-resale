import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
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
        state: 'pending' | 'paid' | 'cancelled';
    };
};

const MAX_CHECKS = 20;

export default function CheckoutSuccess({ order }: Props) {
    const { site } = usePage<SharedProps>().props;
    const checks = useRef(0);

    // Подтверждение от ЮKassa может прийти на несколько секунд позже, чем покупатель вернётся на сайт.
    useEffect(() => {
        if (order.state !== 'pending') {
            return;
        }

        const timer = setInterval(() => {
            if (++checks.current > MAX_CHECKS) {
                clearInterval(timer);

                return;
            }

            router.reload({ only: ['order'] });
        }, 3000);

        return () => clearInterval(timer);
    }, [order.state]);

    useEffect(() => {
        if (order.state === 'paid' && !order.test) {
            reachGoal('purchase', { order_price: order.price_rub });
        }
    }, [order.state, order.test, order.price_rub]);

    return (
        <PageLayout title="Спасибо">
            {order.state === 'paid' && (
                <>
                    <h1 className="page-title">Спасибо!</h1>
                    <p className="page-lead">
                        {rub(order.fund_rub)} из вашей покупки уйдут в {site.fund_name}. Отчёт опубликуем после перевода.
                    </p>
                    {order.test && <p className="notice">Тестовый режим: оплата не подключена, деньги не списаны.</p>}
                </>
            )}

            {order.state === 'pending' && (
                <>
                    <h1 className="page-title">Ждём подтверждение оплаты</h1>
                    <p className="page-lead" role="status">
                        Обычно это занимает несколько секунд. Страница обновится сама.
                    </p>
                </>
            )}

            {order.state === 'cancelled' && (
                <>
                    <h1 className="page-title">Оплата не прошла</h1>
                    <p className="page-lead">Заказ отменён, деньги не списаны. Вещь снова доступна в каталоге.</p>
                </>
            )}

            <dl className="summary-rows summary-rows-wide">
                <div>
                    <dt>Заказ</dt>
                    <dd>{order.number}</dd>
                </div>
                <div>
                    <dt>{order.item_title}</dt>
                    <dd>{rub(order.price_rub)}</dd>
                </div>
            </dl>

            <div className="actions">
                <Link href={to('/fond')} className="btn btn-primary">
                    Отчёты фонда
                </Link>
                <Link href={to('/?open=veshi')} className="btn btn-secondary">
                    В каталог
                </Link>
            </div>
        </PageLayout>
    );
}
