import {z} from "zod";
import {createServerFn} from "@tanstack/react-start";
import backendClient from "@/routes/-auth/backend-client.ts";
import {getSeadocsIndex, getUsersMe} from "seadox-shared/api";
import {createLogger} from "seadox-shared/logger.ts";
import { getAuthTokens } from "./get-auth-tokens.ts";
import {zGetIndexResponse} from "seadox-shared/api/zod.gen.ts";


export const zUser = z.object({
    id: z.string(),
    color: z.string().regex(/^#[a-f0-9]{6}$/),
    avatar: z.url().nullable(),
    name: z.string(),
    email: z.email().nullable()
});
export type User = z.infer<typeof zUser>;

export const zAuthenticationResult = z.object({
    accessToken: z.jwt(),
    user: zUser,
    docs: zGetIndexResponse,
    roles: z.array(z.string()),
});
export type AuthenticationResult = z.infer<typeof zAuthenticationResult>;

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
    const logger = createLogger();

    const { id_token, access_token } = await getAuthTokens();
    if (!id_token || !access_token) {
        return null;
    }

    const idTokenPayload = id_token.split('.', 3)[1]!;
    const idTokenJson = Buffer.from(idTokenPayload, 'base64url').toString('utf-8');

    const { name, email } = z.object({
        name: z.string(),
        email: z.email().optional()
    }).parse(JSON.parse(idTokenJson));
    logger.defaultMeta['username'] = name;

    const backend = backendClient(access_token);
    const meResponse = await getUsersMe({ client: backend });
    if (!meResponse.data) {
        const error = meResponse.error;
        logger.error('There was en error fetching user info from backend', { error })
        throw error;
    }
    const { id, color, avatarUrl } = meResponse.data;

    const indexResponse = await getSeadocsIndex({ client: backend });
    if (!indexResponse.data) {
        const error = indexResponse.error;
        logger.error('There was en error fetching docs index from backend', { error })
        throw error;
    }

    return {
        accessToken: access_token!,
        user: {
            id,
            color,
            name,
            avatar: avatarUrl,
            email: email ?? null,
        },
        roles: [],
        docs: indexResponse.data
    } satisfies AuthenticationResult
})