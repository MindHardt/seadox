import {z} from "zod";
import {createServerFn} from "@tanstack/react-start";
import {getUsersMe} from "seadox-shared/api";
import {createLogger} from "seadox-shared/logger.ts";
import { getAuthTokens } from "./get-auth-tokens.ts";

export const zUser = z.object({
    id: z.string(),
    color: z.string().regex(/^#[a-f0-9]{6}$/),
    avatar: z.url().nullable(),
    name: z.string(),
    email: z.email().nullable(),
    roles: z.array(z.string())
});
export type User = z.infer<typeof zUser>;

export const zAuthenticationResult = z.object({
    accessToken: z.jwt(),
    user: zUser,
    roles: z.array(z.string()),
});
export type AuthenticationResult = z.infer<typeof zAuthenticationResult>;

export const getCurrentUser = createServerFn({ method: 'GET' })
    .handler(async () : Promise<AuthenticationResult | null> => {
        const logger = createLogger();

        const { id_token, access_token } = await getAuthTokens();
        if (!id_token) {
            return null;
        }

        const idTokenPayload = id_token.split('.', 3)[1]!;
        const idTokenJson = Buffer.from(idTokenPayload, 'base64url').toString('utf-8');

        const { name, email } = z.object({
            name: z.string(),
            email: z.email().optional()
        }).parse(JSON.parse(idTokenJson));
        logger.defaultMeta['username'] = name;

        const meResponse = await getUsersMe();
        if (!meResponse.data) {
            const error = meResponse.error;
            logger.error('There was en error fetching user info from backend', { error })
            throw error;
        }
        const { id, color, avatarUrl, roles } = meResponse.data;

        return {
            accessToken: access_token!,
            user: {
                id,
                color,
                name,
                roles,
                avatar: avatarUrl,
                email: email ?? null,
            },
            roles: [],
        } satisfies AuthenticationResult
    })