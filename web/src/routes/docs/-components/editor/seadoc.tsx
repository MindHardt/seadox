import {SeadocModel} from "seadox-shared/api";
import {CSSProperties, useRef} from "react";
import useTextareaBinding from "@/routes/docs/-components/editor/use-textarea-binding.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import useProviderSync from "@/routes/docs/-components/editor/use-provider-sync.ts";
import {HocuspocusProvider} from "@hocuspocus/provider";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import {CatchBoundary, ErrorComponentProps} from "@tanstack/react-router";
import {Alert} from "@/components/ui/alert.tsx";
import {Bug} from "lucide-react";
import {BlockNoteView} from "@blocknote/shadcn";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

export default function Seadoc({ doc, editor, provider } : {
    doc: SeadocModel,
    editor: ReturnType<typeof useSeadoxEditor>,
    provider?: HocuspocusProvider
}) {
    const name = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);

    useTextareaBinding(name, 'name', provider);
    useTextareaBinding(description, 'description', provider);

    const synced = useProviderSync(provider);

    const readOnly = !(synced && (doc.accessLevel === 'Write'));

    const errorComponent = (e : ErrorComponentProps) =>
        <Alert className='flex flex-col items-center gap-2' variant='destructive'>
            <Bug />
            <p className='font-extrabold'>Произошла ошибка при загрузке документа.</p>
            <p className='font-mono'>{e.error.message}</p>
        </Alert>;

    return <article className='flex flex-col gap-2'>
        <input ref={name} type='text' defaultValue={doc.name} readOnly={readOnly}
               className='p-2 text-6xl font-bold h-20 outline-none w-full'/>
        <Textarea ref={description} defaultValue={doc.description} readOnly={readOnly}
                  placeholder={readOnly ? undefined : 'Описание...'}
                  className='px-4 md:text-xl text-xl outline-none w-full border-0 shadow-none resize-none'/>
        {editor && <CatchBoundary getResetKey={() => 'doc-body-' + doc.id} errorComponent={errorComponent}>
            <BlockNoteView
                className='w-full'
                style={{ '--background': 'var(--color-background)', '--foreground': 'var(--color-foreground)' } as CSSProperties}
                editor={editor}
                editable={doc.accessLevel === "Write"}>
            </BlockNoteView>
        </CatchBoundary>}
    </article>
}