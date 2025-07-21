import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const loginFn = createServerFn({ method: 'POST' })
    .validator(z.object({ returnUrl: z.string().url() }))
    .handler(({ data }) => {
        
    })