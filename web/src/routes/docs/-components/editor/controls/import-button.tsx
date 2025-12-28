import {postUploadsMigrate} from "seadox-shared/api";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import {Button} from "@/components/ui/button.tsx";
import {PlaneTakeoff, Upload} from "lucide-react";
import uploadPath from "@/routes/-backend/upload-path.ts";
import { client } from "@/routes/-backend/backend-client";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {useState, useTransition} from "react";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Input} from "@/components/ui/input.tsx";


export default function ImportButton({ editor } : {
    editor: ReturnType<typeof useSeadoxEditor>
}) {

    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [md, setMd] = useState('');
    const [host, setHost] = useState('');
    const [migrate, setMigrate] = useState(false);

    const button = <Button variant='outline' disabled={!editor}>
        <Upload />
    </Button>

    if (!editor) {
        return button;
    }

    const getMigratedUrl = async (url: string) => {
        try {
            const base = new URL(host);
            url = new URL(url, base).href;
        } finally { }
        const { data: migrated } = await postUploadsMigrate({ client, throwOnError: true, body: {
                url, scope: 'Attachment'
            }});
        return uploadPath(migrated);
    }
    const importMd = () => startTransition(async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(md);

        migrate && await Promise.all(blocks
            .flatMap(x => [x, ...x.children])
            .map(async block => {
                switch (block.type) {
                    case 'file':
                        block.props.url = await getMigratedUrl(block.props.url);
                        break;
                    case 'image':
                        block.props.url = await getMigratedUrl(block.props.url);
                        break;
                    case 'audio':
                        block.props.url = await getMigratedUrl(block.props.url);
                }
            }))

        editor.replaceBlocks(editor.document, blocks);
        setOpen(false);
    });

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {button}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader><DialogTitle>Импорт Markdown</DialogTitle></DialogHeader>
            <div className='flex flex-col gap-2 max-h-80'>
                <div className='overflow-y-auto'>
                    <Textarea disabled={pending} value={md} onChange={e => setMd(e.target.value)} />
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className='flex flex-row gap-1 items-center me-auto'>
                            <Switch disabled={pending} checked={migrate} onCheckedChange={setMigrate} />
                            Перенести файлы
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Скопировать файлы и изображения на сервера Seadox</p></TooltipContent>
                </Tooltip>
                {migrate && <Tooltip>
                    <TooltipTrigger asChild>
                        <Input value={host} onChange={e => setHost(e.target.value)} placeholder='host' />
                    </TooltipTrigger>
                    <TooltipContent><p>Базовый адрес для относительных ссылок</p></TooltipContent>
                </Tooltip>}
                <Button onClick={importMd}>
                    Импорт
                    <PlaneTakeoff />
                </Button>
            </div>
        </DialogContent>
    </Dialog>

}