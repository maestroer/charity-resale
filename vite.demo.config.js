import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Статичное демо для GitHub Pages. Сайт отдаётся из подпапки /имя-репозитория/.
const base = process.env.DEMO_BASE ?? '/charity-resale/';

export default defineConfig({
    root: fileURLToPath(new URL('./resources/demo', import.meta.url)),
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./resources/js', import.meta.url)) },
    },
    define: {
        'import.meta.env.VITE_APP_BASE': JSON.stringify(base.replace(/\/$/, '')),
        'import.meta.env.VITE_DEMO': JSON.stringify('true'),
    },
    build: {
        outDir: fileURLToPath(new URL('./dist-demo', import.meta.url)),
        emptyOutDir: true,
    },
});
