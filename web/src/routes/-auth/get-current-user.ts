import {z} from "zod";
import {createServerFn} from "@tanstack/react-start";
import backendClient from "@/routes/-auth/backend-client.ts";
import {getUsersMe} from "seadox-shared/api";
import {createLogger} from "seadox-shared/logger.ts";
import { getAuthTokens } from "./get-auth-tokens.ts";


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
    roles: z.array(z.string()),
});
export type AuthenticationResult = z.infer<typeof zAuthenticationResult>;

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
    const logger = createLogger();

    const tokens = await getAuthTokens();
    if (!tokens) {
        return null;
    }

    const idTokenPayload = tokens.id_token?.split('.', 3)[1]!;
    const idTokenJson = Buffer.from(idTokenPayload, 'base64url').toString('utf-8');

    const { name, email } = z.object({
        name: z.string(),
        email: z.email().optional()
    }).parse(JSON.parse(idTokenJson));

    const backend = backendClient(tokens.access_token);
    const { data, error } = await getUsersMe({ client: backend });
    if (!data) {
        logger.error('There was en error fetching user info from backend', { error })
        throw error;
    }

    return {
        accessToken: tokens.access_token!,
        user: {
            id: data.id,
            color: data.color,
            avatar: data.avatarUrl,
            email: email ?? null,
            name,
        },
        roles: []
    } satisfies AuthenticationResult
})