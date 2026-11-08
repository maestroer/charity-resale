import { DONATE } from '@/content/donate';
import { FOUNDER } from '@/content/founder';
import { INVESTMENTS } from '@/content/investments';
import { INVESTOR } from '@/content/investor';
import { MONEY_SPLIT } from '@/content/money';
import { plural, rub } from '@/lib/format';
import type { Item, Site, Stats } from '@/types';

export type TerminalContext = {
    items: Item[];
    stats: Stats;
    site: Site;
};

/** Строка ответа: обычный текст или текст, который копируется по клику. */
export type AnswerLine = string | { text: string; copy: string };

type Answer = (context: TerminalContext) => AnswerLine[];

const investShare = MONEY_SPLIT[2].share;

// Заготовленные ответы терминала: без запросов к ИИ.
export const TERMINAL_ANSWERS: Record<string, Answer> = {
    каталог: ({ items }) => {
        const onSale = items.filter((item) => !item.draft && !item.sold && !item.reserved && item.price_rub !== null);

        if (onSale.length === 0) {
            return ['сейчас в продаже ничего нет. следите за следующим дропом.'];
        }

        return [
            `в продаже ${onSale.length} ${plural(onSale.length, ['вещь', 'вещи', 'вещей'])}:`,
            ...onSale.map((item) => `· ${item.title} — ${item.auction ? 'аукцион, сейчас ' : ''}${rub(item.price_rub ?? 0)}, в фонд ${rub(item.fund_rub ?? 0)}`),
            'откройте блок «Вещи», чтобы посмотреть всё.',
        ];
    },
    инвестиции: () => {
        if (INVESTMENTS.length === 0) {
            return [
                `${investShare} с каждой продажи копится на специальном счёте, чтобы вкладывать в фонды и стартапы.`,
                'вложений пока не было — первые проекты появятся здесь после первых продаж.',
            ];
        }

        return [
            `проекты, в которые мы вложили деньги (${INVESTMENTS.length}):`,
            ...INVESTMENTS.map(({ name, what, amount_rub, year }) => `· ${name} — ${what}, ${rub(amount_rub)}, ${year}`),
        ];
    },
    фонд: ({ site, stats }) => [
        `30% стоимости каждой вещи уходит в фонд ${site.fund_name}.`,
        `уже собрано: ${rub(stats.fund_total_rub)}.`,
    ],
    команда: () => [
        `${FOUNDER.name} — ${FOUNDER.heading.toLowerCase()}.`,
        `${FOUNDER.role}, ${FOUNDER.background}.`,
        ...FOUNDER.links.map(({ label, href }) => `· ${label}: ${href}`),
    ],
    участники: ({ items }) => {
        const owners = [...new Set(items.map((item) => item.owner.name).filter((name): name is string => Boolean(name)))];

        if (owners.length === 0) {
            return [
                'здесь будут известные люди, которые передали проекту свои вещи.',
                'первые участники появятся с первым дропом.',
            ];
        }

        return [`вещи проекту передали (${owners.length}):`, ...owners.map((name) => `· ${name}`)];
    },
    донат: () => [
        'поддержать проект — нажмите на реквизит, чтобы скопировать:',
        ...[DONATE.card, ...DONATE.crypto].map((method) => ({
            text: `· ${method.label}${method.network ? `, ${method.network}` : ''}: ${method.display ?? method.value}`,
            copy: method.value,
        })),
        DONATE.warning.toLowerCase(),
    ],
    контакты: () => [
        'почта — нажмите, чтобы скопировать:',
        { text: INVESTOR.contact.email, copy: INVESTOR.contact.email },
        `telegram: ${INVESTOR.contact.telegram}`,
    ],
    доставка: () => [
        'доставка — сдэк до пункта выдачи по россии, уже входит в цену.',
        'отправляем в течение 3 рабочих дней после оплаты, трек-номер придёт на email.',
    ],
    возврат: () => [
        'не подошла — вернуть можно в течение 7 дней, если вещь не носили и сохранены бирки.',
        'не соответствует описанию — 14 дней, обратную доставку оплатим мы.',
        'подробнее — на странице «доставка и возврат».',
    ],
    отчёты: ({ stats }) => [
        'по каждой продаже публикуем отчёт с платёжкой.',
        stats.sold_count === 0
            ? 'продаж пока не было — первый отчёт появится после первого перевода.'
            : `продано ${stats.sold_count} ${plural(stats.sold_count, ['вещь', 'вещи', 'вещей'])}. все отчёты — на странице /fond.`,
    ],
    помощь: () => [`темы: ${TERMINAL_TOPICS.join(', ')}.`, 'нажмите на тему или напишите её в строке ниже.'],
};

export const TERMINAL_TOPICS = Object.keys(TERMINAL_ANSWERS);

export const unknownAnswer = (command: string): string[] => [
    `не знаю темы «${command}».`,
    `попробуйте: ${TERMINAL_TOPICS.join(', ')}.`,
];
