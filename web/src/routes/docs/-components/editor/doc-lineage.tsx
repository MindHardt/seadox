import { Link } from "@tanstack/react-router";
import {SeadocModel} from "seadox-shared/api";
import {ChevronDown, ChevronRight, Plus} from "lucide-react";
import CreateDocDialog from "@/routes/docs/-components/create-doc-dialog.tsx";
import {DialogTrigger} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";


export default function DocLineage({ doc } : {
    doc: SeadocModel
}) {
    const lineage = [...doc.lineage].reverse();
    lineage.pop();

    return <div className='flex flex-col gap-1 p-2 md:ms-auto'>
        {lineage.map(x => <Link key={x.id} to='/docs/$id' params={{ id: x.id }} className='flex flex-row items-center'>
            <ChevronDown />
            <span className='text-lg'>{x.name}</span>
        </Link>)}
        <span className='font-semibold text-xl'>{doc.name}</span>
        {doc.children.map(x => <Link key={x.id} to='/docs/$id' params={{ id: x.id }} className='flex flex-row items-center'>
            <ChevronRight />
            <span className='text-lg'>{x.name}</span>
        </Link>)}
        <CreateDocDialog parentId={doc.id}>
            <DialogTrigger asChild>
                <Button variant='outline' className='w-30'>
                    <Plus />
                    <span className='text-lg'>Создать</span>
                </Button>
            </DialogTrigger>
        </CreateDocDialog>
    </div>

}