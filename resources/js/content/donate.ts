// Реквизиты для доната проекту ВИФ. Это поддержка самого проекта, а не покупка вещи и не перевод в благотворительный фонд.
// `value` копируется по клику ровно как есть, `display` — как показать на странице.
export type DonateMethod = { label: string; network?: string; value: string; display?: string };

export const DONATE = {
    title: 'Поддержать проект',
    lead: 'Донат идёт на развитие ВИФ: съёмку вещей, сайт и доставку. Нажмите на реквизит, чтобы скопировать его.',
    card: { label: 'Карта', network: 'перевод по номеру карты', value: '2200152965799474', display: '2200 1529 6579 9474' } as DonateMethod,
    crypto: [
        { label: 'BTC', network: 'Bitcoin', value: 'bc1qnnnepmhu3yfe24ccgnm82ppy0ga3vj9qxz559t' },
        { label: 'USDT', network: 'сеть TRC-20 (Tron)', value: 'TLAB5PAT2ksK8eixRmefRxcdZ5DmPV6FjT' },
        { label: 'SOL', network: 'Solana', value: 'Hvrc9QikDxRLZNogHjcKCFUHRx8HCvXd3JB8dSrR7ZYK' },
    ] as DonateMethod[],
    warning: 'Отправляйте монеты только в указанной сети: перевод в другой сети не дойдёт и не вернётся.',
};
