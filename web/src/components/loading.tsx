import {Sun} from "lucide-react";
import {ComponentProps} from "react";
import {cn} from "@/lib/utils.ts";


export default function Loading({ className, ...props } : ComponentProps<typeof Sun>) {
    return <Sun className={cn('animate-ping text-accent-foreground', className)} {...props} />
}