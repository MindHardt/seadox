import { Seadoc } from "../-types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Settings, Trash} from "lucide-react";
import DocVisibilityCheck from "@/routes/docs/-components/doc-visibility-check";
import DeleteDocButton from "@/routes/docs/-components/delete-doc-button";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import {getSupabaseServerClient} from "@/utils/supabase";
import {Result} from "@/lib/result";
import { useContext } from "react";
import {DocContext} from "@/routes/docs/-components/doc-context";

const setCoverRequest = z.object({
    coverUrl: z.string().url().nullable(),
    docId: z.string().uuid()
});
const setCoverFn = createServerFn({ method: 'POST' })
    .validator(setCoverRequest)
    .handler(async ({ data }) : Promise<Result> => {
       const supabase = getSupabaseServerClient();
       const { error } = await supabase
           .from('seadocs')
           .update({ cover_url: data.coverUrl })
           .eq('id', data.docId);

export default function DocControls({ doc } : {
    doc: Seadoc
}) {

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant='outline'>
                <Settings />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start'>
            <DropdownMenuLabel>Управление</DropdownMenuLabel>
            <DropdownMenuGroup>
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <DocVisibilityCheck doc={doc} />
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Обложка</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {doc.coverUrl && <DropdownMenuItem
                                variant='destructive'
                                onClick={async () => setCoverFn({ data: { docId: doc.id, coverUrl: null }})}>
                                <Trash />
                                Удалить
                            </DropdownMenuItem>}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive'>
                    <DeleteDocButton doc={doc} />
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}