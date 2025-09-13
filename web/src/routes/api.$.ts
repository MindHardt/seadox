import {createServerFileRoute} from "@tanstack/react-start/server";
import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";

const backendUrl = new URL(process.env.BACKEND_URL!);
async function proxyRequest({ request }: { request: Request }): Promise<Response> {
    const { access_token } = await getAuthTokens();
    if (access_token) {
        request.headers.set('Authorization', 'Bearer ' + access_token);
    }

    const requestUrl = new URL(request.url);
    requestUrl.protocol = backendUrl.protocol;
    requestUrl.host = backendUrl.host;
    requestUrl.pathname = requestUrl.pathname.startsWith('/api')
        ? requestUrl.pathname.substring(4)
        : requestUrl.pathname;

    const proxiedRequest = new Request(requestUrl, request);
    return await fetch(proxiedRequest);
}

export const ServerRoute = createServerFileRoute('/api/$').methods({
   GET: proxyRequest,
   POST: proxyRequest,
   PUT: proxyRequest,
   DELETE: proxyRequest,
   PATCH: proxyRequest,
});
