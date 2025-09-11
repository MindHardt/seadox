import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'http://localhost:8080/openapi/v1.json',
    output: 'api/',
    plugins: [
        '@tanstack/react-query',
        'zod'
    ]
})