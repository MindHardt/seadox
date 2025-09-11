import {createClient} from "seadox-shared/api/client";
import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";
import {client as generatedClient} from "seadox-shared/api/client.gen.ts";

export const apiPrefix = '/api';
const isSsr = import.meta.env.SSR;
const baseUrl = isSsr ? process.env.BACKEND_URL : apiPrefix;

type BackendClient = typeof generatedClient;
export function configureClient(client: BackendClient) {
    client.setConfig({
        baseUrl
    });
    if (isSsr) {
        client.interceptors.request.use(appendAccessToken);
    }
}

const client = createClient();
configureClient(client);
export { client };

async function appendAccessToken(request: Request) {
    const { access_token } = await getAuthTokens();
    if (access_token) {
        request.headers.set('Authorization', `Bearer ${access_token}`);
    }
    return request;
}