// Проекты, в которые ВИФ вложил деньги со специального счёта. Выводятся в терминале по теме «инвестиции».
// Добавляйте по одной записи на вложение: { name: 'Название', what: 'фонд или стартап, чем занимается', amount_rub: 100000, year: 2027 }.
export type Investment = { name: string; what: string; amount_rub: number; year: number };

export const INVESTMENTS: Investment[] = [];
