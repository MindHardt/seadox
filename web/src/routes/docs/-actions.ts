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
                id: doc.id as string,
                name: doc.name as string,
                public: doc.public as boolean,
                ownerId: doc.owner_id as string
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
                id: doc.id as string,
                name: doc.name as string,
                public: doc.public as boolean,
                ownerId: doc.owner_id as string
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
            .eq('id', data.id)
            .select();

        return error ? {
            success: false,
            error: error.message
        } : {
            success: true
        }
    })