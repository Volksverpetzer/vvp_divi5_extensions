import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    root: __dirname,
    plugins: [react()],
    resolve: {
        alias: {
            react: path.resolve(__dirname, '../node_modules/react'),
            'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
            '@divi/module': path.resolve(__dirname, 'mocks/divi-module.tsx'),
        },
    },
    server: {
        fs: {
            allow: [path.resolve(__dirname, '..')],
        },
        proxy: {
            '/api/instaById': {
                target: 'https://volksverpetzer-app.de',
                changeOrigin: true,
                secure: true,
            },
        },
    },
});
