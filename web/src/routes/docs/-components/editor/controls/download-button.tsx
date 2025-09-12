import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Download} from "lucide-react";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import {SeadocModel} from "seadox-shared/api";


export default function DownloadButton({ doc, editor } : {
    doc: SeadocModel
    editor: ReturnType<typeof useSeadoxEditor>
}) {


    const downloadText = (text: string, fileName: string, contentType: string) => {
        const obj = new Blob([text], { type: contentType });
        const url = URL.createObjectURL(obj);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    }

    if (!editor) {
        return <Button disabled><Download /></Button>
    }

    const downloadMd = async () => {
        const md = await editor.blocksToMarkdownLossy(editor.document);
        downloadText(md, doc.name + '.md', 'text/markdown');
    }
    const downloadHtml = async () => {
        const html = await editor.blocksToHTMLLossy(editor.document);
        downloadText(html, doc.name + '.html', 'text/html');
    }
    const downloadJson = () => {
        const json = JSON.stringify(editor.document);
        downloadText(json, doc.name + '.json', 'application/json');
    }

    return <Popover>
        <PopoverTrigger asChild>
            <Button><Download /></Button>
        </PopoverTrigger>
        <PopoverContent className='w-20'>
            <div className='flex flex-col gap-1'>
                <Button variant='ghost' onClick={downloadMd}>.md</Button>
                <Button variant='ghost' onClick={downloadHtml}>.html</Button>
                <Button variant='ghost' onClick={downloadJson}>.json</Button>
            </div>
        </PopoverContent>
    </Popover>
}