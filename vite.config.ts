import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'preview',
    plugins: [react()],
    server: {
        port: 8899,
    },
    css: {
        preprocessorOptions: {
            scss: {
                // silence deprecation warnings from legacy sass API
                silenceDeprecations: ['legacy-js-api'],
            },
        },
    },
});
