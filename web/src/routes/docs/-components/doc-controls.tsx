import { Seadoc } from "../-types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Settings} from "lucide-react";
import DocVisibilityCheck from "@/routes/docs/-components/doc-visibility-check";
import DeleteDocButton from "@/routes/docs/-components/delete-doc-button";

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
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <DeleteDocButton doc={doc} />
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}