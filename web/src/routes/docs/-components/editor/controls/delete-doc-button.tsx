import {SeadocModel} from "seadox-shared/api";
import {useQuery} from "@tanstack/react-query";
import {getSeadocsByIdOptions} from "seadox-shared/api/@tanstack/react-query.gen.ts";
import {deleteSeadocsById} from "seadox-shared/api/sdk.gen.ts";
import {Button} from "@/components/ui/button.tsx";
import {Trash2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";
import {useRouter} from "@tanstack/react-router";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger} from "@/components/ui/dialog.tsx";
import {canManage} from "@/routes/docs/-utils.ts";

export default function DeleteDocButton({ doc } : {
    doc: SeadocModel
}) {

    const router = useRouter();
    const { refetch: refetchUser } = useQuery(CurrentUserOptions());
    const { data: user } = useQuery({
        ...CurrentUserOptions(),
        select: data => data?.user
    });
    const { data: docData, refetch } = useQuery({
        ...getSeadocsByIdOptions({ path: { Id: doc.id }})
    });

    const deleteDoc = async () => {
        await deleteSeadocsById({ path: { Id: doc.id }});
        await refetchUser();

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
