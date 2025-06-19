import {z} from "zod";

export const seadocSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    coverUrl: z.string().url().optional()
})
export type Seadoc = z.infer<typeof seadocSchema>