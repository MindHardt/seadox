import {Seadoc} from "@/routes/docs/-types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import {deleteDocFn} from "@/routes/docs/-actions";
import { Trash } from "lucide-react";


export default function DeleteDocButton({ doc } : {
    doc: Seadoc
}) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteDoc = useCallback(async () => {
        const { success } = await deleteDocFn({ data: { id: doc.id }});
        if (success) {
            await queryClient.invalidateQueries({ queryKey: ['docs', 'index'] });
            await router.navigate({ to: '/' });
        }
    }, [doc.id]);

    return <a className="flex items-center gap-3 text-red-500" onClick={deleteDoc}>
        <Trash />
        Удалить документ
    </a>
}