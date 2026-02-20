import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/services/**/*.ts', 'src/sockets/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/index.ts'],
        },
        testTimeout: 10000,
        hookTimeout: 10000,
    },
});
