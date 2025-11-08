import {createClient} from "seadox-shared/api/client";
import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";

const client = createClient({
    baseUrl: process.env?.BACKEND_URL ?? '/api',
    signal: null
});
if (import.meta.env.SSR) {
    client.interceptors.request.use(appendAccessToken);
}

async function appendAccessToken(request: Request) {
    const { access_token } = await getAuthTokens();
    if (access_token) {
        request.headers.set('Authorization', `Bearer ${access_token}`);
    }
    return request;
}

export { client }