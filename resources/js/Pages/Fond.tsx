import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { plural, rub } from '@/lib/format';
import { useCountUp } from '@/lib/useCountUp';
import type { SharedProps } from '@/types';

type Transfer = {
    id: number;
    date: string;
    item_title: string;
    price_rub: number;
    fund_rub: number;
    receipt_url: string | null;
};

type Props = {
    total_rub: number;
    sold_count: number;
    transfers: Transfer[];
};

export default function Fond({ total_rub, sold_count, transfers }: Props) {
    const { site } = usePage<SharedProps>().props;
    const totalRef = useRef<HTMLParagraphElement>(null);
    const [inView, setInView] = useState(false);
    const total = useCountUp(total_rub, inView);

    // Счётчик стартует, только когда сумма попала во вьюпорт.
    useEffect(() => {
        const element = totalRef.current;
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold: 0.5 });
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <PageLayout title="Фонд">
            <p className="meta">{site.fund_name}</p>
            <h1 className="page-title">Уже собрано</h1>
            <p ref={totalRef} className="fond-total" aria-label={rub(total_rub)}>
                {rub(total)}
            </p>
            <p className="page-lead">
                30% стоимости каждой вещи уходит в фонд. Продано {sold_count} {plural(sold_count, ['вещь', 'вещи', 'вещей'])}. По
                каждой продаже мы публикуем перевод с платёжкой.
            </p>

            <h2 className="page-subtitle">Отчёты</h2>
            {transfers.length === 0 ? (
                <p>Переводов пока не было. Первый отчёт появится здесь после первой продажи.</p>
            ) : (
                <div className="table-wrap">
                    <table className="report">
                        <thead>
                            <tr>
                                <th scope="col">Дата</th>
                                <th scope="col">Вещь</th>
                                <th scope="col" className="num">
                                    Цена
                                </th>
                                <th scope="col" className="num">
                                    В фонд
                                </th>
                                <th scope="col">Платёжка</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((transfer) => (
                                <tr key={transfer.id}>
                                    <td>{transfer.date}</td>
                                    <td>{transfer.item_title}</td>
                                    <td className="num">{rub(transfer.price_rub)}</td>
                                    <td className="num">{rub(transfer.fund_rub)}</td>
                                    <td>
                                        {transfer.receipt_url ? (
                                            <a href={transfer.receipt_url} target="_blank" rel="noopener">
                                                PDF
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageLayout>
    );
}
