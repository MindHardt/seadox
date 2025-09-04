import {createClient} from "seadox-shared/api/client";
import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";
import {ResolvedRequestOptions} from "seadox-shared/api/client/types.gen.ts";
import {client} from "seadox-shared/api/client.gen.ts";

export const apiPrefix = '/api';
const isSsr = import.meta.env.SSR;
const baseUrl = isSsr ? process.env.BACKEND_URL : apiPrefix;

type BackendClient = typeof client;
export function configureClient(client: BackendClient) {
    client.setConfig({
        baseUrl
    });
    if (isSsr) {
        client.interceptors.request.use(appendAccessToken);
    }
}

export function backendClient() {
    const client = createClient();
    configureClient(client);
    return client;
}

async function appendAccessToken(request: ResolvedRequestOptions) {
    const { access_token } = await getAuthTokens();
    if (access_token) {
        request.headers = {
            ...request.headers,
            'Authorization': `Bearer ${access_token}`
        }
    }
}