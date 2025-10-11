import {ComponentProps, CSSProperties} from "react";
import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {useQuery} from "@tanstack/react-query";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {Check} from "lucide-react";

type Color = Exclude<CSSProperties['color'], undefined>;
const palette: Color[] = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#62748e'
]

export default function UserColorPicker({ onSelected, className, ...props } : {
    onSelected?: (color: Color) => void | Promise<void>
} & ComponentProps<'div'>) {

    const { data } = useQuery(currentUserOptions());

    return <div className={cn('grid gap-2', className)} {...props}>
        {palette.map(x => <Button
            key={x}
            style={{ backgroundColor: x }}
            onClick={() => onSelected && onSelected(x)}>
            {data?.user.color === x && <Check />}
        </Button>)}
    </div>
}