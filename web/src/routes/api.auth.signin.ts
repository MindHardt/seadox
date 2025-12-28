import {setCookie} from "@tanstack/react-start/server";
import {oauth} from "@/routes/-auth/oauth.ts";
import {zitadel} from "@/routes/-auth/zitadel.ts";
import {createFileRoute, redirect} from "@tanstack/react-router";
import {z} from "zod";

const zSearch = z.object({
    returnUrl: z.string().optional()
})

export const Route = createFileRoute("/api/auth/signin")({
    validateSearch: zSearch,
    server: {
        handlers: {
            GET: async ({ request }) => {
                const redirectUri = new URL('/api/auth/callback', request.url);
                const cookieOpts = {
                    httpOnly: true,
                    maxAge: 600,
                    path: '/',
                    sameSite: 'lax' as const,
                }

                const { returnUrl } = zSearch.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
                if (returnUrl) {
                    setCookie('returnUrl', returnUrl, cookieOpts);
                }

                const { codeVerifier, codeChallenge } = oauth.generateCodeVerifier();
                setCookie('codeVerifier', codeVerifier, cookieOpts);

                const state = oauth.generateState();
                setCookie('state', state, cookieOpts);

                const authUrl = zitadel.buildAuthorizationUrl({
                    state,
                    codeChallenge,
                    redirectUri
                });
                return redirect({ href: authUrl.href });
            }
        }
    }
})