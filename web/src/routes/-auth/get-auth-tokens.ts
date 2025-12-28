import {createServerOnlyFn} from "@tanstack/react-start";
import {clearTokens, persistTokens, retrieveTokens, StoredTokens} from "@/routes/-auth/persistence.ts";
import {TokenResponse, zitadel} from "@/routes/-auth/zitadel.ts";
import {createLogger} from "seadox-shared/logger.ts";

const refreshRequests = new Map<string, Promise<TokenResponse>>();

export const getAuthTokens = createServerOnlyFn(async () : Promise<Partial<StoredTokens>> => {


    let { access_token, id_token, refresh_token } = retrieveTokens();
    if (access_token && refresh_token && id_token) {
        return { access_token, refresh_token, id_token }
    }
    if (!refresh_token) {
        return {};
    }

    try {
        let promise = refreshRequests.get(refresh_token);
        if (!promise) {
            promise = zitadel.refreshTokens({ refreshToken: refresh_token })
                .then(res => {
                    setTimeout(() => refreshRequests.delete(refresh_token), res.expires_in);
                    return res;
                })
            refreshRequests.set(refresh_token, promise);
        }

        const newTokens = await promise;
        clearTokens();
        persistTokens(newTokens);
        return newTokens;
    } catch (error) {
        createLogger('Seadox-web', 'getAuthTokens').error(
            'There was an error refreshing tokens', { error }
        )
        clearTokens();
        return {};
    }
})