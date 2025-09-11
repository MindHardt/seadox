import {SeadocModel} from "seadox-shared/api";
import {useRef} from "react";
import useTextareaBinding from "@/routes/docs/-components/editor/use-textarea-binding.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import BlocknoteEditor from "@/routes/docs/-components/editor/blocknote/blocknote-editor.tsx";
import useProviderSync from "@/routes/docs/-components/editor/use-provider-sync.ts";
import {HocuspocusProvider} from "@hocuspocus/provider";


export default function Seadoc({ doc, provider } : {
    doc: SeadocModel,
    provider?: HocuspocusProvider
}) {
    const name = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);

    useTextareaBinding(name, 'name', provider);
    useTextareaBinding(description, 'description', provider);

    const synced = useProviderSync(provider);

    const readOnly = !(synced && (doc.accessLevel === 'Write'));

    return <article className='flex flex-col gap-2'>
        <input ref={name} type='text' defaultValue={doc.name} readOnly={readOnly}
               className='p-2 text-6xl font-bold h-20 outline-none w-full'/>
        <Textarea ref={description} defaultValue={doc.description} readOnly={readOnly}
                  placeholder={readOnly ? undefined : 'Описание...'}
                  className='px-4 md:text-xl text-xl outline-none w-full border-0 shadow-none resize-none'/>
        {provider && <BlocknoteEditor doc={doc} provider={provider} />}
    </article>
}