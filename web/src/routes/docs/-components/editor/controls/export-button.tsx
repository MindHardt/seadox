import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Download} from "lucide-react";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import {SeadocModel} from "seadox-shared/api";
import {HocuspocusProvider} from "@hocuspocus/provider";
import * as Y from "yjs";


export default function ExportButton({ doc, editor, provider } : {
    doc: SeadocModel
    editor: ReturnType<typeof useSeadoxEditor>,
    provider?: HocuspocusProvider
}) {

    if (!editor || !provider) {
        return <Button disabled><Download /></Button>
    }

    const downloadText = (data: BlobPart, fileName: string, contentType: string) => {
        const obj = new Blob([data], { type: contentType });
        const url = URL.createObjectURL(obj);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    }

    const downloadMd = async () => {
        const { name, description } = getHeader(provider);
        const md =
            `# ${name}\n\n` +
            description + '\n\n' +
            await editor.blocksToMarkdownLossy(editor.document);
        downloadText(md, doc.name + '.md', 'text/markdown');
    }
    const downloadHtml = async () => {
        const { name, description } = getHeader(provider);
        const html =
            `<h1>${name}</h1>\n\n` +
            `<p>${description}</p>\n\n` +
            await editor.blocksToHTMLLossy(editor.document);
        downloadText(html, doc.name + '.html', 'text/html');
    }
    const downloadJson = () => {
        const json = JSON.stringify({
            ...getHeader(provider),
            content: editor.document
        });
        downloadText(json, doc.name + '.json', 'application/json');
    }
    const downloadYjs = () => {
        const yjs = new Uint8Array(Y.encodeStateAsUpdate(provider.document));
        downloadText(yjs, doc.name + '.yjs', 'application/octet-stream');
    }

    return <Popover>
        <PopoverTrigger asChild>
            <Button variant='outline'><Download /></Button>
        </PopoverTrigger>
        <PopoverContent className='w-20'>
            <div className='flex flex-col gap-1'>
                <Button variant='ghost' onClick={downloadMd}>.md</Button>
                <Button variant='ghost' onClick={downloadHtml}>.html</Button>
                <Button variant='ghost' onClick={downloadJson}>.json</Button>
                <Button variant='ghost' onClick={downloadYjs}>.yjs</Button>
            </div>
        </PopoverContent>
    </Popover>
}

const getHeader = (provider: HocuspocusProvider) => ({
    name: provider.document.getText('name').toString(),
    description: provider.document.getText('description').toString()
})