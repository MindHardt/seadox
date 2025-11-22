import {getAuthTokens} from "@/routes/-auth/get-auth-tokens.ts";
import {Hono} from "hono";
import {proxy} from "hono/proxy";
import {createFileRoute} from "@tanstack/react-router";
import {compress} from "hono/compress";

export const Route = createFileRoute('/api/$')({
    server: {
        handlers: {
            GET: proxyRequest,
            POST: proxyRequest,
            PUT: proxyRequest,
            DELETE: proxyRequest,
            PATCH: proxyRequest,
            OPTIONS: proxyRequest,
        }
    }
})

const backendUrl = new URL(process.env.BACKEND_URL!);
const proxyServer = new Hono().use(compress());
proxyServer.all('*', async ({ req }) => {
    const requestUrl = new URL(req.url);
    requestUrl.protocol = backendUrl.protocol;
    requestUrl.host = backendUrl.host;
    const { method, body, headers,} = req.raw;

    return proxy(requestUrl, {
        method, body, headers,
        // @ts-expect-error
        duplex: 'half',
        signal: null
    });
})

async function proxyRequest({ request }: { request: Request }): Promise<Response> {
    const { access_token } = await getAuthTokens();
    if (access_token) {
        request.headers.set('Authorization', 'Bearer ' + access_token);
    }

    console.log('Proxy request', request);
    try {
        const res = await proxyServer.fetch(request);
        console.log('Proxy response', res);
        return res;
    } catch (error) {
        return Response.json({ error }, {
            status: 503
        })
    }
}
