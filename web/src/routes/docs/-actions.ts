import {createServerFn} from "@tanstack/react-start";
import z from "zod";
import {getSupabaseServerClient} from "@/utils/supabase";
import {Seadoc} from "@/routes/docs/-types";
import {Result} from "@/lib/result";


export const createDocRequest = z.object({
    parentId: z.string().nullable(),
    name: z.string().min(3, 'Имя документа должно быть не короче 3х символов')
});
export const createDocFn = createServerFn({ method: 'POST' })
    .validator(createDocRequest)
    .handler(async ({ data }) : Promise<Result<Seadoc>> => {
        const supabase = getSupabaseServerClient();

        const { data: docs, error } = await supabase
            .from('seadocs')
            .insert({ name: data.name, parent_id: data.parentId })
            .select();
        if (error) {
            return {
                success: false as const,
                error: error.message
            }
        }

        const doc = docs.pop()!;

        return {
            success: true as const,
            value: {
                id: doc.id,
                name: doc.name,
                public: doc.public,
                ownerId: doc.owner_id,
                coverUrl: doc.cover_url,
                description: doc.description
            }
        }
    });

const getDocRequest = z.object({
    id: z.string().uuid()
});
export const getDocFn = createServerFn()
    .validator(getDocRequest)
    .handler(async ({ data }) : Promise<Result<Seadoc>> => {
        const supabase = getSupabaseServerClient();
        const { data: docs, error } = await supabase
            .from('seadocs')
            .select()
            .eq('id', data.id);

        if (error) {
            return {
                success: false as const,
                error: error.message
            }
        }

        const doc = docs?.pop();
        if (!doc) {
            return {
                success: false as const,
                error: '404' as const
            }
        }

        return {
            success: true as const,
            value: {
                id: doc.id,
                name: doc.name,
                public: doc.public,
                ownerId: doc.owner_id,
                coverUrl: doc.cover_url,
                description: doc.description
            }
        }
    });

const changeDocVisibilityRequest = z.object({
    isPublic: z.boolean()
}).merge(getDocRequest)
export const changeDocVisibilityFn = createServerFn({ method: 'POST' })
    .validator(changeDocVisibilityRequest)
    .handler(async ({ data }) : Promise<Result> => {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase
            .from('seadocs')
            .update({ public: data.isPublic })
            .eq('id', data.id);

        return error ? {
            success: false,
            error: error.message
        } : {
            success: true
        }
    });

export const deleteDocRequest = z.object({}).merge(getDocRequest);
export const deleteDocFn = createServerFn({ method: 'POST' })
    .validator(deleteDocRequest)
    .handler(async ({ data }): Promise<Result> => {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase
            .from('seadocs')
            .delete()
            .eq('id', data.id);
        return error ? {
            success: false,
            error: error.message
        } : {
            success: true
        }
    })

type SeadocPost = Seadoc & { url: string }
export const getDashboardFn = createServerFn()
    .handler(async (): Promise<Result<SeadocPost[]>> => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
            .from('seadocs')
            .select('*, posts!inner ( url )')
            .order('id', { referencedTable: 'posts', ascending: true })
            .not('posts.url', 'is', null);

        return error
            ? {
                success: false,
                error: error.message
            } : {
                success: true,
                value: data.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    public: doc.public,
                    ownerId: doc.owner_id,
                    coverUrl: doc.cover_url,
                    description: doc.description,
                    url: doc.posts.url,
                }))
            }
    });