import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rub } from '@/lib/format';
import type { ItemDetail } from '@/types';
import { to } from '@/lib/url';

/** Почему вещь нельзя купить прямо сейчас. */
function unavailableReason(item: ItemDetail): string {
    if (item.sold) {
        return 'Эта вещь уже продана.';
    }

    if (item.draft || item.price_rub === null) {
        return 'Скоро в продаже.';
    }

    return 'Вещь прямо сейчас оформляет другой покупатель. Если оплата не пройдёт, она вернётся в продажу через 15 минут.';
}

/** Карточка вещи: панель, выезжающая справа поверх сетки. */
export function ItemPanel({ item }: { item: ItemDetail | null }) {
    // Пока панель уезжает, продолжаем показывать последнюю вещь.
    const [shown, setShown] = useState(item);
    const [photoIndex, setPhotoIndex] = useState(0);
    const closeButton = useRef<HTMLButtonElement>(null);
    const open = item !== null;

    useEffect(() => {
        if (item) {
            setShown(item);
            setPhotoIndex(0);
            closeButton.current?.focus({ preventScroll: true });
        }
    }, [item]);

    const close = useCallback(() => {
        router.visit(to('/?open=veshi'), { preserveState: true, preserveScroll: true });
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        // Esc закрывает только карточку: каталог под ней остаётся раскрытым.
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopImmediatePropagation();
                close();
            }
        };

        window.addEventListener('keydown', onKey, true);

        return () => window.removeEventListener('keydown', onKey, true);
    }, [open, close]);

    const photo = shown?.photos[photoIndex] ?? shown?.photos[0];
    const facts = shown
        ? [
              ['Проект', shown.project?.title],
              ['Сцена', shown.scene],
              ['Образ', shown.look],
              ['Размер', shown.size],
              ['Состояние', shown.condition],
              ['Замеры', shown.measurements],
          ].filter((fact): fact is [string, string] => Boolean(fact[1]))
        : [];

    return (
        <>
            {item && <Head title={item.title} />}
            <div className="item-overlay" data-open={open || undefined} onClick={close} />
            <aside
                className="item-panel"
                data-open={open || undefined}
                inert={!open}
                role="dialog"
                aria-modal="true"
                aria-label={shown?.title}
            >
                <div className="item-panel-head">
                    <span className="meta">{shown?.project?.title}</span>
                    <button ref={closeButton} type="button" className="menu-close meta" onClick={close}>
                        Закрыть
                    </button>
                </div>

                {shown && (
                    <div className="item-panel-body">
                        <div className="item-gallery">
                            <div className="item-photo">
                                {photo ? (
                                    <img src={photo.url} srcSet={`${photo.url} 800w, ${photo.full} 1600w`} sizes="(min-width: 768px) 45vw, 100vw" alt={photo.alt} />
                                ) : (
                                    <span className="meta">{shown.brand ?? 'фото скоро'}</span>
                                )}
                            </div>
                            {shown.photos.length > 1 && (
                                <ul className="item-thumbs">
                                    {shown.photos.map((thumb, index) => (
                                        <li key={thumb.url}>
                                            <button
                                                type="button"
                                                aria-label={`Фото ${index + 1}`}
                                                aria-pressed={index === photoIndex}
                                                onClick={() => setPhotoIndex(index)}
                                            >
                                                <img src={thumb.thumb} alt="" loading="lazy" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {shown.video_url && (
                                // eslint-disable-next-line jsx-a11y/media-has-caption
                                <video className="item-video" src={shown.video_url} controls preload="metadata" playsInline />
                            )}
                        </div>

                        <div className="item-info">
                            <h2 className="item-title">{shown.title}</h2>
                            {shown.story && <p className="item-story">{shown.story}</p>}

                            {facts.length > 0 && (
                                <dl className="item-facts">
                                    {facts.map(([label, value]) => (
                                        <div key={label}>
                                            <dt className="meta">{label}</dt>
                                            <dd>{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            )}

                            {shown.price_rub !== null && shown.fund_rub !== null && (
                                <div className="item-buy">
                                    <p className="item-price">{rub(shown.price_rub)}</p>
                                    <p className="card-fund">из них в фонд — {rub(shown.fund_rub)}</p>
                                </div>
                            )}

                            {shown.available ? (
                                <Link href={to(`/checkout?item=${shown.slug}`)} className="btn btn-primary">
                                    Купить
                                </Link>
                            ) : (
                                <p className="item-unavailable">{unavailableReason(shown)}</p>
                            )}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
