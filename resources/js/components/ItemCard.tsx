import { Link } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { rub } from '@/lib/format';
import type { Item } from '@/types';
import { to } from '@/lib/url';

export function ItemCard({ item, index }: { item: Item; index: number }) {
    const [photo, second] = item.photos;
    const details = [item.project?.title, item.size].filter(Boolean).join(' · ');

    return (
        <Link
            href={to(`/veshi/${item.slug}`)}
            preserveState
            preserveScroll
            className="card"
            data-sold={item.sold || undefined}
            style={{ '--i': index + 2 } as CSSProperties}
        >
            <div className="card-photo">
                {photo ? (
                    <>
                        <img src={photo.thumb} alt={photo.alt} loading="lazy" />
                        {second && <img className="card-photo-second" src={second.thumb} alt="" loading="lazy" />}
                    </>
                ) : (
                    <span className="meta">{item.brand ?? 'фото скоро'}</span>
                )}
                {item.sold && <span className="card-sold meta">Продано</span>}
            </div>
            <h3 className="card-title">{item.title}</h3>
            {details && <p className="card-details">{details}</p>}
            {item.price_rub !== null && item.fund_rub !== null ? (
                <>
                    <p className="card-price">{rub(item.price_rub)}</p>
                    <p className="card-fund">из них в фонд — {rub(item.fund_rub)}</p>
                </>
            ) : (
                <p className="card-fund">скоро в продаже</p>
            )}
        </Link>
    );
}
