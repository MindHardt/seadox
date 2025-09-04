import {createClient} from "seadox-shared/api/client";
import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";

export default function backendClient() {

    const isSsr = import.meta.env.SSR;
    const baseUrl = isSsr ? process.env.BACKEND_URL : '/api';

    const client = createClient({ baseUrl });

    if (isSsr) {
        client.interceptors.request.use(async (request) => {
            const { access_token } = await getAuthTokens();
            if (access_token) {
                request.headers = {
                    ...request.headers,
                    'Authorization': `Bearer ${access_token}`
                }
            }
        });
        client.interceptors.error.use(async (error) => {
            const { createLogger } = await import('seadox-shared/logger.ts');
            createLogger().error('There was an error fetching data from backend', { error });
        })
    }

    return client;
}