import '@fontsource-variable/onest';
import '@fontsource-variable/jetbrains-mono';
import '../css/pages.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { hit } from '@/lib/metrika';

const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx');

// Первый просмотр Метрика считает сама, дальнейшие переходы внутри Inertia отправляем вручную.
let firstNavigation = true;
router.on('navigate', (event) => {
    if (firstNavigation) {
        firstNavigation = false;

        return;
    }

    hit(event.detail.page.url);
});

createInertiaApp({
    resolve: async (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Страница не найдена: ${name}`);
        }

        return (await page()).default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#1D253E' },
});
