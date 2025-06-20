import { Seadoc } from "../-types";
import {useCallback, useTransition} from "react";
import {Label} from "@/components/ui/label";
import {useQueryClient} from "@tanstack/react-query";
import {changeDocVisibilityFn} from "@/routes/docs/-actions";
import {Ellipsis, Eye, EyeOff} from "lucide-react";


export default function DocVisibilityCheck({ doc } : {
    doc: Seadoc
}) {
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const changeVisibility = useCallback(({ isPublic }: { isPublic: boolean }) => startTransition(async () => {
        const { success } = await changeDocVisibilityFn({ data: { id: doc.id, isPublic } });
        if (success) {
            await queryClient.invalidateQueries({ queryKey: ['doc', doc.id] });
        }
    }), [doc.id])

    return <div className="flex items-center gap-3" onClick={() => changeVisibility({ isPublic: !doc.public })}>
        {isPending ? <Ellipsis/> : doc.public ? <Eye className='text-green-600' /> : <EyeOff />}
        <Label htmlFor="public">Публичный</Label>
    </div>
}