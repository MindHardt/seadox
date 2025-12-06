import {z} from "zod";

type AuthorizationUrlParameters = {
    state: string,
    codeChallenge: string,
    redirectUri: URL
}
type ExchangeTokenParameters = {
    code: string,
    codeVerifier: string,
    redirectUri: URL
}
type RefreshTokenParameters = {
    refreshToken: string,
}
type RevokeTokenParameters = RefreshTokenParameters;
const zTokenResponse = z.object({
    expires_in: z.number(),
    access_token: z.jwt(),
    id_token: z.jwt(),
    refresh_token: z.string()
});
export type TokenResponse = z.infer<typeof zTokenResponse>

interface IdentityProvider {
    buildAuthorizationUrl: (params: AuthorizationUrlParameters) => URL,
    exchangeTokens: (params: ExchangeTokenParameters) => Promise<TokenResponse>,
    refreshTokens: (params: RefreshTokenParameters) => Promise<TokenResponse>,
    revokeTokens: (params: RevokeTokenParameters) => Promise<void>
}

const zitadelUrl = process.env.ZITADEL_URL;
const zitadelPublicUrl = import.meta.env.VITE_ZITADEL_URL as string ?? zitadelUrl;
const clientId = process.env.ZITADEL_CLIENT_ID;
if (!zitadelUrl || !clientId) {
    throw new Error("Zitadel not configured");
}
const headers = {
    'Host': zitadelPublicUrl
};

export const zitadel : IdentityProvider = {
    buildAuthorizationUrl: (params) => {

        const url = new URL('/oauth/v2/authorize', zitadelPublicUrl);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', clientId);
        url.searchParams.set('code_challenge', params.codeChallenge);
        url.searchParams.set('code_challenge_method', 'S256');
        url.searchParams.set('scope', ['openid', 'profile', 'offline_access'].join(' '));
        url.searchParams.set('prompt', 'select_account');
        url.searchParams.set('state', params.state);
        url.searchParams.set('redirect_uri', params.redirectUri.href);

        return url;
    },
    exchangeTokens: async (params) => {
        const url = new URL('/oauth/v2/token', zitadelUrl);
        const redirect_uri = params.redirectUri instanceof URL
            ? params.redirectUri.href
            : params.redirectUri

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri,
                client_id: clientId,
                code_verifier: params.codeVerifier,
            })
        });
        if (!res.ok) {
            throw new Error(`There was an error trying to exchange tokens: ${res.status}. Error: ${await res.text()}`);
        }
        return await res.json().then(zTokenResponse.parse);
    },
    refreshTokens: async (params) => {
        const url = new URL('/oauth/v2/token', zitadelUrl);
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: params.refreshToken,
                client_id: clientId
            })
        });
        if (!res.ok) {
            throw new Error(`There was an error trying to refresh tokens: ${res.status}. Error: ${await res.text()}`);
        }
        return await res.json().then(zTokenResponse.parse);
    },
    revokeTokens: async (params) => {
        const url = new URL('/oauth/v2/revoke', zitadelPublicUrl);
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: new URLSearchParams({
                token: params.refreshToken,
                token_type_hint: 'refresh_token',
                client_id: clientId
            })
        });
        if (!res.ok) {
            throw new Error(`There was an error trying to revoke tokens. Status: ${res.status}. Error: ${await res.text()}`);
        }
    }
}