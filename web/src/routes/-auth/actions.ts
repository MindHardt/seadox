import z from "zod";
import {createServerFn} from "@tanstack/react-start";
import {getSupabaseServerClient} from "@/utils/supabase";
import {redirect} from "@tanstack/react-router";
import {Result} from "@/lib/result";

export const userSchema = z.object({
    id: z.string().uuid(),
    avatar: z.string().url().optional(),
    // Username stored as user metadata
    username: z.string().optional(),
    email: z.string().optional(),
    meta: z.record(z.string(), z.any()),
    // Effective username or fallback
    name: z.string(),
    color: z.string().regex(/#[0-9a-f]{6}/)
});
export type UserData = z.infer<typeof userSchema>;

export const randomColor = () => '#' + (Math.floor(Math.random() * 16777217)).toString(16).padEnd(6, '0');
export const getCurrentUserFn = createServerFn().handler(async () : Promise<Result<UserData>> => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        return {
            success: false,
            error: error.message
        };
    }

    const user = data.user;

    return {
        success: true,
        value: {
            id: user.id,
            avatar: user.user_metadata['avatar_url'] as string | undefined,
            username: user.user_metadata['username'] as string | undefined,
            meta: user.user_metadata,
            email: user.email,
            name: user.user_metadata['username'] ?? user.email ?? 'ANON',
            color: user.user_metadata['color'] ?? randomColor(),
        }
    }
});

export const logoutRequestSchema = z.object({
    returnUrl: z.string().url().optional(),
});
export const logoutFn = createServerFn({ method: 'POST' })
    .validator(logoutRequestSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message,
            }
        }

        throw redirect({
            href: data.returnUrl ?? '/',
        })
    })

export const signInRequest = z.object({
    email: z.string().email(),
    password: z.string(),
    action: z.enum(['login', 'register'])
}).merge(logoutRequestSchema);
export const signInFn = createServerFn({ method: 'POST' })
    .validator(signInRequest)
    .handler(async ({ data }) : Promise<Result> => {
        const supabase = getSupabaseServerClient()
        const { error } = data.action === 'login'
            ? await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })
            : await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: data.returnUrl
                }
            })

        if (error) {
            return {
                success: false,
                error: error.message,
            }
        }

        if (data.action === 'login') {
            throw redirect({
                href: data.returnUrl ?? '/',
            })
        }

        return { success: true }
    });

