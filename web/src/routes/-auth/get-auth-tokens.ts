import {createServerFn} from "@tanstack/react-start";
import {persistTokens, retrieveTokens, StoredTokens} from "@/routes/-auth/persistence.ts";
import {zitadel} from "@/routes/-auth/zitadel.ts";
import {createLogger} from "seadox-shared/logger.ts";

export const getAuthTokens = createServerFn({ method: 'GET' }).handler(async () : Promise<Partial<StoredTokens>> => {
    let { access_token, id_token, refresh_token } = retrieveTokens();
    if (access_token && refresh_token && id_token) {
        return { access_token, refresh_token, id_token }
    }
    if (!refresh_token) {
        return {};
    }

    try {
        const newTokens = await zitadel.refreshTokens({ refreshToken: refresh_token });
        persistTokens(newTokens);
        return newTokens;
    } catch (error) {
        createLogger('Seadox-web', 'getAuthTokens').error(
            'There was an error refreshing tokens', { error }
        )
        return {};
    }
})