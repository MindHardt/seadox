import { Link } from "@tanstack/react-router";
import {SeadocModel} from "seadox-shared/api";
import {
    ArrowDown,
    CornerDownRight,
    ListPlus
} from "lucide-react";
import CreateDocDialog from "@/routes/docs/-components/create-doc-dialog.tsx";
import {DialogTrigger} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useQuery} from "@tanstack/react-query";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";


export default function DocLineage({ doc } : {
    doc: SeadocModel
}) {
    const { data: userId } = useQuery({
        ...currentUserOptions(),
        select: data => data?.user.id
    });

    const canCreate = userId === doc.ownerId;

    const lineage = [...doc.lineage].reverse();
    lineage.pop();

    return <div className='flex flex-col gap-1 p-2 md:ms-auto'>
        {lineage.map(x => <Link key={x.id} to='/docs/$id' params={{ id: x.id }} className='flex flex-row items-center'>
            <ArrowDown />
            <span className='text-lg'>{x.name}</span>
        </Link>)}
        <span className='font-semibold text-xl py-1 border-y'>{doc.name}</span>
        {doc.children.map(x => <Link
            key={x.id} to='/docs/$id' params={{ id: x.id }}
            className='flex flex-row gap-1 items-center'>
            <CornerDownRight />
            <span className='text-lg'>{x.name}</span>
        </Link>)}
        {canCreate && <CreateDocDialog parentId={doc.id}>
            <DialogTrigger asChild>
                <Button variant='outline' className='w-full max-w-36'>
                    <ListPlus />
                    <span className='text-lg hidden lg:inline'>Новый</span>
                </Button>
            </DialogTrigger>
        </CreateDocDialog>}
    </div>

}