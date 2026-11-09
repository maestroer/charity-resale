import { rub } from '@/lib/format';
import { to } from '@/lib/url';
import type { Item } from '@/types';

/** Цена так, как её видит покупатель в карточке. */
function priceText(item: Item): string | null {
    if (item.sold) {
        return 'уже продан';
    }

    if (item.auction) {
        const { open, current_rub, start_rub } = item.auction;

        if (current_rub === null) {
            return open ? `аукцион, стартовая цена ${rub(start_rub)}` : 'аукцион завершён без ставок';
        }

        return open ? `аукцион, текущая ставка ${rub(current_rub)}` : `аукцион завершён, итоговая ставка ${rub(current_rub)}`;
    }

    return item.price_rub !== null ? rub(item.price_rub) : null;
}

/** Текст первого сообщения менеджеру: что за вещь и ссылка на неё. */
export function managerMessage(item: Item, origin: string = window.location.origin): string {
    const about = [item.owner.name, item.size ? `размер ${item.size}` : null, priceText(item)].filter(Boolean).join(', ');

    return [`Привет! Меня заинтересовал товар «${item.title}»${about ? ` — ${about}` : ''}.`, origin + to(`/veshi/${item.slug}`)].join('\n');
}

/** Ссылка t.me открывает чат с менеджером, текст уже вставлен в поле ввода — остаётся нажать «Отправить». */
export function managerLink(login: string, item: Item): string {
    return `https://t.me/${login}?text=${encodeURIComponent(managerMessage(item))}`;
}
