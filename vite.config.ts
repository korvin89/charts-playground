import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/charts-playground/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'chart-sandbox': resolve(__dirname, 'chart-sandbox-iframe.html'),
                'config-sandbox': resolve(__dirname, 'config-sandbox-iframe.html'),
            },
        },
    },
});
