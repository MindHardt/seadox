import {deleteCookie, getCookie} from '@tanstack/react-start/server'
import {zitadel} from "@/routes/-auth/zitadel.ts";
import {persistTokens} from "@/routes/-auth/persistence.ts";
import {createFileRoute, redirect} from "@tanstack/react-router";

export const Route = createFileRoute('/api/auth/callback')({
    server: {
        handlers: {
            GET: async ({ request }) => {

                const requestUrl = new URL(request.url);
                const state = requestUrl.searchParams.get('state');
                const code = requestUrl.searchParams.get('code');

                if (!state || !code) {
                    return new Response('No state and/or code parameter found', {
                        status: 400
                    });
                }

                const storedState = getCookie('state');
                const codeVerifier = getCookie('codeVerifier');

                if (!storedState || !codeVerifier || storedState !== state) {
                    return new Response(null, {
                        status: 401
                    });
                }

                const redirectUri = new URL(request.url);
                redirectUri.search = '';
                const tokens = await zitadel.exchangeTokens({
                    code,
                    codeVerifier,
                    redirectUri
                });
                persistTokens(tokens);

                const returnUrl = getCookie('returnUrl') ?? '/';
                deleteCookie('state');
                deleteCookie('codeVerifier');
                deleteCookie('returnUrl');

                return redirect({ href: returnUrl, reloadDocument: true });
            }
        }
    }
})