import {z} from "zod";
import {createServerFn} from "@tanstack/react-start";
import {persistTokens, retrieveTokens} from "@/routes/api/-auth/persistence.ts";
import {zitadel} from "@/routes/api/-auth/zitadel.ts";
import {backendClient} from "@/routes/api/-auth/backend.ts";
import {getUsersMe} from "seadox-shared/api";


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
    let tokens = retrieveTokens();
    if (!tokens.access_token || !tokens.id_token) {
        if (!tokens.refresh_token) {
            return null;
        }

        const newTokens = await zitadel.refreshTokens({ refreshToken: tokens.refresh_token });
        persistTokens(newTokens);
        tokens = newTokens;
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