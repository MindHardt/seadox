import {createServerFileRoute, setCookie} from "@tanstack/react-start/server";
import {oauth} from "@/routes/api/-auth/oauth.ts";
import {zitadel} from "@/routes/api/-auth/zitadel.ts";
import {redirect} from "@tanstack/react-router";


export const ServerRoute = createServerFileRoute("/api/auth/signin").methods({
    GET: async ({ request }) => {
        const redirectUri = new URL('/api/auth/callback', request.url);
        const cookieOpts = {
            httpOnly: true,
            maxAge: 600,
            path: '/',
            sameSite: 'lax' as const,
        }

        const returnUrl = new URL(request.url).searchParams.get('returnUrl');
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
})