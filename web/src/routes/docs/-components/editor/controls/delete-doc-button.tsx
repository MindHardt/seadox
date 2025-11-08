import {SeadocModel} from "seadox-shared/api";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getSeadocsByIdOptions} from "seadox-shared/api/@tanstack/react-query.gen.ts";
import {deleteSeadocsById} from "seadox-shared/api/sdk.gen.ts";
import {Button} from "@/components/ui/button.tsx";
import {Trash2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {useRouter} from "@tanstack/react-router";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger} from "@/components/ui/dialog.tsx";
import {canManage} from "@/routes/docs/-utils.ts";
import {client} from "@/routes/-backend/backend-client.ts";
import {getSeadocsIndexOptions} from "seadox-shared/api/@tanstack/react-query.gen";

export default function DeleteDocButton({ doc } : {
    doc: SeadocModel
}) {

    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: docData, refetch } = useQuery({
        ...getSeadocsByIdOptions({ client, path: { Id: doc.id }})
    });
    const { data: user } = useQuery({
        ...currentUserOptions(),
        select: data => data?.user
    })

    const deleteDoc = async () => {
        await deleteSeadocsById({ client, path: { Id: doc.id }});
        await queryClient.fetchQuery({
            ...getSeadocsIndexOptions({ client })
        });

        const redirectTo = docData!.lineage.map(x => x.id).at(1);
        await router.navigate(redirectTo ? { to: '/docs/$id', params: { id: redirectTo }} : { to: '/docs' })

        await refetch();
    }

    const hasChildren = docData?.children.length !== 0;
    const canDelete = !hasChildren && user && canManage(user, docData);

    const button = <Button className='w-full' disabled={!canDelete}>
        <Trash2 />
    </Button>;
    if (canDelete) {
        return <Dialog>
            <DialogTrigger asChild>{button}</DialogTrigger>
            <DialogContent>
                <p>Вы уверены что хотите удалить документ?</p>
                <DialogFooter>
                    <DialogClose asChild><Button variant='secondary'>Отмена</Button></DialogClose>
                    <Button variant='destructive' onClick={deleteDoc}>
                        <Trash2 />
                        Удалить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    } else {
        return hasChildren
            ? <Tooltip>
                <TooltipTrigger asChild>
                    <div className='h-9'>
                        {button}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Сначала удалите дочерние документы</p>
                </TooltipContent>
            </Tooltip>
            : button;
    }
}
