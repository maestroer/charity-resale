const NBSP = ' ';
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** 43100 → «43 100 ₽» с неразрывными пробелами между разрядами и перед ₽. */
export function rub(amount: number): string {
    return `${number.format(amount).replace(/\s/g, NBSP)}${NBSP}₽`;
}

/** plural(5, ['вещь', 'вещи', 'вещей']) → «вещей» */
export function plural(n: number, forms: [string, string, string]): string {
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return forms[0];
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return forms[1];
    }

    return forms[2];
}
