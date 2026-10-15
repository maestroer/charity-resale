import { rub } from '@/lib/format';

export const CONDITIONS = ['новое с биркой', 'отличное', 'хорошее', 'есть следы носки'] as const;

export type AppraiseRequest = {
    brand: string;
    item_type: string;
    condition: string;
    captcha_token?: string;
};

type Payload = {
    status: 'pending' | 'done' | 'failed' | 'limited' | 'resting' | 'captcha_required';
    token?: string;
    price_rub?: number;
    fund_rub?: number;
    message?: string;
    client_key?: string;
};

export type AppraiseOutcome = { kind: 'lines'; lines: string[] } | { kind: 'captcha'; clientKey: string };

const POLL_MS = 1500;
const MAX_POLLS = 80;

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Запрашивает предварительную оценку. Сервер возвращает только два числа:
 * оценку стоимости в проекте и сумму в фонд.
 */
export async function appraise(request: AppraiseRequest): Promise<AppraiseOutcome> {
    const fail = (text: string): AppraiseOutcome => ({ kind: 'lines', lines: [text] });

    try {
        const response = await fetch('/appraise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
            credentials: 'same-origin',
            body: JSON.stringify(request),
        });
        let payload = (await response.json()) as Payload;

        if (payload.status === 'captcha_required' && payload.client_key) {
            return { kind: 'captcha', clientKey: payload.client_key };
        }

        if (payload.status === 'limited' || payload.status === 'resting') {
            return fail(payload.message?.toLowerCase() ?? 'оценщик сейчас недоступен.');
        }

        if (!response.ok && response.status !== 202) {
            return fail('не получилось оценить: проверьте, что бренд и тип вещи заполнены.');
        }

        for (let i = 0; payload.status === 'pending' && payload.token && i < MAX_POLLS; i++) {
            await sleep(POLL_MS);
            payload = (await (await fetch(`/appraise/${payload.token}`, { headers: { Accept: 'application/json' } })).json()) as Payload;
        }

        if (payload.status !== 'done' || payload.price_rub === undefined || payload.fund_rub === undefined) {
            return fail('оценить не получилось. попробуйте ещё раз чуть позже.');
        }

        return {
            kind: 'lines',
            lines: [`≈ ${rub(payload.price_rub)} — столько вещь стоила бы в проекте`, `из них в фонд ≈ ${rub(payload.fund_rub)}`, 'оценка предварительная.'],
        };
    } catch {
        return fail('нет связи с сервером. попробуйте ещё раз.');
    }
}

declare global {
    interface Window {
        smartCaptcha?: { render: (container: HTMLElement, params: { sitekey: string; hl?: string; callback: (token: string) => void }) => number };
    }
}

/** Показывает Yandex SmartCaptcha в контейнере и возвращает токен, когда посетитель её прошёл. */
export function solveCaptcha(container: HTMLElement, clientKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const render = () => window.smartCaptcha?.render(container, { sitekey: clientKey, hl: 'ru', callback: resolve });

        if (window.smartCaptcha) {
            render();

            return;
        }

        const script = document.createElement('script');
        script.src = 'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload';
        script.defer = true;
        script.onload = render;
        script.onerror = () => reject(new Error('captcha'));
        document.head.appendChild(script);
    });
}
