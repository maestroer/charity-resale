/**
 * Сайт работает от корня домена, а статичное демо на GitHub Pages — из подпапки /имя-репозитория/.
 * Все внутренние ссылки строятся через to(), а адреса разбираются через appPath().
 */
export const APP_BASE = String(import.meta.env.VITE_APP_BASE ?? '').replace(/\/$/, '');

/** Статичное демо без сервера: оплаты, админки и оценщика нет. */
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true';

export function to(path: string): string {
    return APP_BASE + path;
}

/** Адрес без подпапки демо: «/имя-репозитория/veshi/x?y» → «/veshi/x?y». */
export function appPath(url: string): string {
    const parsed = new URL(url, window.location.origin);
    let path = parsed.pathname;

    if (APP_BASE && path.startsWith(APP_BASE)) {
        path = path.slice(APP_BASE.length) || '/';
    }

    return path + parsed.search;
}
