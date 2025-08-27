import {TokenResponse} from "./zitadel";
import {deleteCookie, getCookie, setCookie} from "@tanstack/react-start/server";


export function persistTokens(tokens: TokenResponse) {
    const cookieOpts = {
        sameSite: 'lax' as const,
        path: '/',
        httpOnly: true
    }
    setCookie('access_token', tokens.access_token, {
        ...cookieOpts,
        maxAge: tokens.expires_in - 1000
    });
    setCookie('id_token', tokens.id_token, {
        ...cookieOpts,
        maxAge: tokens.expires_in - 1000
    })
    setCookie('refresh_token', tokens.refresh_token, cookieOpts);
}

export function retrieveTokens() : Partial<TokenResponse> {
    return {
        access_token: getCookie('access_token'),
        id_token: getCookie('id_token'),
        refresh_token: getCookie('refresh_token'),
    }
}

export function clearTokens() {
    deleteCookie('access_token');
    deleteCookie('id_token');
    deleteCookie('refresh_token');
}