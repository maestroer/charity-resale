import { plural, rub } from '@/lib/format';
import type { Item, Site, Stats } from '@/types';

export type TerminalContext = {
    items: Item[];
    stats: Stats;
    site: Site;
};

type Answer = (context: TerminalContext) => string[];

// Заготовленные ответы терминала: без запросов к ИИ. Исключение — «оценить»: её ведёт пошаговый диалог в Terminal.tsx.
export const TERMINAL_ANSWERS: Record<string, Answer> = {
    каталог: ({ items }) => {
        const onSale = items.filter((item) => !item.draft && !item.sold && item.price_rub !== null);

        if (onSale.length === 0) {
            return ['сейчас в продаже ничего нет. следите за следующим дропом.'];
        }

        return [
            `в продаже ${onSale.length} ${plural(onSale.length, ['вещь', 'вещи', 'вещей'])}:`,
            ...onSale.map((item) => `· ${item.title} — ${rub(item.price_rub ?? 0)}, в фонд ${rub(item.fund_rub ?? 0)}`),
            'откройте блок «Вещи», чтобы посмотреть всё.',
        ];
    },
    оценить: () => [],
    фонд: ({ site, stats }) => [
        `30% стоимости каждой вещи уходит в фонд ${site.fund_name}.`,
        `уже собрано: ${rub(stats.fund_total_rub)}.`,
    ],
    доставка: () => ['[ЗАПОЛНИТЬ: способы, сроки и стоимость доставки]'],
    возврат: () => ['[ЗАПОЛНИТЬ: условия возврата]'],
    отчёты: ({ stats }) => [
        'по каждой продаже публикуем отчёт с платёжкой.',
        stats.sold_count === 0
            ? 'продаж пока не было — первый отчёт появится после первого перевода.'
            : `продано ${stats.sold_count} ${plural(stats.sold_count, ['вещь', 'вещи', 'вещей'])}. все отчёты — на странице /fond.`,
    ],
    помощь: () => ['темы: каталог, оценить, фонд, доставка, возврат, отчёты.', 'нажмите на тему или напишите её в строке ниже.'],
};

export const TERMINAL_TOPICS = Object.keys(TERMINAL_ANSWERS);

export const unknownAnswer = (command: string): string[] => [
    `не знаю темы «${command}».`,
    `попробуйте: ${TERMINAL_TOPICS.join(', ')}.`,
];
