import {createClient} from "seadox-shared/api/client";
import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";
import {createIsomorphicFn} from "@tanstack/react-start";

export const client = createIsomorphicFn()
    .client(() => createClient({
        baseUrl: '/api',
    }))
    .server(() => {
        const client = createClient({
            baseUrl: process.env?.BACKEND_URL
        });
        client.interceptors.request.use(async req => {
            const { access_token } = await getAuthTokens();
            if (access_token) {
                req.headers.set('Authorization', `Bearer ${access_token}`);
            }
            return req;
        });
        return client;
    })()