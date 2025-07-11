import { Seadoc } from "../-types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Settings} from "lucide-react";
import DocVisibilityCheck from "@/routes/docs/-components/doc-visibility-check";
import DeleteDocButton from "@/routes/docs/-components/delete-doc-button";
import DocCoverControls from "@/routes/docs/-components/doc-cover-controls";
import { HocuspocusProvider } from "@hocuspocus/provider";

export default function DocControls({ doc, provider } : {
    doc: Seadoc,
    provider: HocuspocusProvider
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
                <DocCoverControls doc={doc} provider={provider} />
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive'>
                    <DeleteDocButton doc={doc} />
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}