import {z} from "zod";

export const seadocSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    public: z.boolean(),
    ownerId: z.string().uuid(),
    coverUrl: z.string().url().nullable()
})
export type Seadoc = z.infer<typeof seadocSchema>