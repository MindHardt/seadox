import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import {schema} from "@/routes/docs/-components/editor/editor";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";


export const Spoiler = createReactBlockSpec(
    {
        type: 'spoiler',
        content: 'inline',
        propSchema: {
            'summary': {
                default: 'Spoiler!'
            }
        }

    }, {
        render: (props) => {
            const [open, setOpen] = useState(false);

            return <Card className='w-full'>
                <CardHeader className='flex flex-row gap-2 items-center'>
                    <ChevronRight className={'cursor-pointer'} onClick={() => setOpen(x => !x)} />

                </CardHeader>
                <CardContent className={'ease-in duration-300 transition-[height]' + (open ? ' h-[0px] overflow-hidden' : '')} ref={props.contentRef}>

                </CardContent>
            </Card>
        }
    });

export function insertSpoiler(editor: typeof schema.BlockNoteEditor){
    // noinspection JSUnusedGlobalSymbols
    return {
        title: "Spoiler",
        subtext: "Hidden content that expands on click",
        icon: <ChevronRight />,
        onItemClick: () =>
            insertOrUpdateBlock(editor, {
                type: 'spoiler',
            }),
        aliases: ['spoiler', 'details', 'disclosure'],
        group: "Basic blocks",
    }
}
