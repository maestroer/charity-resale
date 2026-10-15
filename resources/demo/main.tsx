/**
 * Статичное демо для GitHub Pages. Сервера нет, поэтому переходы Inertia перехватываются
 * и отдаются из pages.json — снимка страниц полной версии сайта с уже посчитанными ценами.
 */
import '../css/app.css';
import { router } from '@inertiajs/react';
import { appPath, to } from '@/lib/url';
import pages from './pages.json';

type Snapshot = { component: string; props: Record<string, unknown> };
type Item = { slug: string; title: string; price_rub: number; fund_rub: number };

const snapshots = pages as Record<string, Snapshot>;
const VERSION = 'demo';

/** Какой снимок показать по адресу. «/?open=…» — та же главная, раскрытый блок хранится в адресе. */
function snapshotFor(path: string): Snapshot {
    const [pathname] = path.split('?');

    return snapshots[path] ?? snapshots[pathname] ?? snapshots['/'];
}

/** Оформленный заказ в демо: страница «Спасибо» в тестовом режиме, без сервера и без денег. */
function demoSuccess(form: Record<string, unknown>): Snapshot {
    const checkout = snapshots[`/checkout?item=${String(form.item)}`];
    const item = checkout?.props.item as Item | undefined;

    return {
        component: 'CheckoutSuccess',
        props: {
            ...snapshots['/'].props,
            order: {
                number: 'DEMO',
                item_title: item?.title ?? '',
                price_rub: item?.price_rub ?? 0,
                fund_rub: item?.fund_rub ?? 0,
                test: true,
                state: 'paid',
            },
        },
    };
}

router.on('before', (event) => {
    const visit = event.detail.visit;
    const path = appPath(visit.url.href);
    const snapshot = visit.method === 'post' && path.startsWith('/checkout') ? demoSuccess(visit.data as Record<string, unknown>) : snapshotFor(path);
    const url = visit.method === 'post' ? to('/checkout/success?order=DEMO') : visit.url.href;

    // Отменяем запрос к серверу и меняем страницу на клиенте.
    event.preventDefault();
    setTimeout(() =>
        router.push({
            url,
            component: snapshot.component,
            props: snapshot.props,
            preserveState: visit.preserveState === true,
            preserveScroll: visit.preserveScroll === true,
        }),
    );
});

const initialPath = appPath(window.location.href);
const initial = snapshotFor(initialPath);
document.getElementById('app')!.dataset.page = JSON.stringify({
    component: initial.component,
    props: initial.props,
    url: window.location.pathname + window.location.search,
    version: VERSION,
    clearHistory: false,
    encryptHistory: false,
});

import('@/app');
