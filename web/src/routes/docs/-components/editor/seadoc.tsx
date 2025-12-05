import {SeadocModel} from "seadox-shared/api";
import {CSSProperties, useEffect, useRef} from "react";
import useTextareaBinding from "@/routes/docs/-components/editor/use-textarea-binding.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import useProvider from "@/routes/docs/-components/editor/use-provider.ts";
import {HocuspocusProvider} from "@hocuspocus/provider";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import {CatchBoundary, ErrorComponentProps} from "@tanstack/react-router";
import {Alert} from "@/components/ui/alert.tsx";
import {Bug} from "lucide-react";
import {BlockNoteView} from "@blocknote/shadcn";

import Loading from "@/components/loading.tsx";
import Toolbar from "@/routes/docs/-components/editor/blocknote/toolbar.tsx";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./seadoc.css";

export default function Seadoc({ doc, editor, provider } : {
    doc: SeadocModel,
    editor: ReturnType<typeof useSeadoxEditor>,
    provider?: HocuspocusProvider
}) {

    const name = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);

    useTextareaBinding(name, 'name', provider);
    useTextareaBinding(description, 'description', provider);

    const { synced, scope } = useProvider(provider);
    useEffect(() => {
        if (provider) {
            (async () => {
                provider.connect();
            })();
        }
    }, [provider]);
    const editable = scope == 'read-write';

    const errorComponent = (e : ErrorComponentProps) =>
        <Alert className='flex flex-col items-center gap-2' variant='destructive'>
            <Bug />
            <p className='font-extrabold'>Произошла ошибка при загрузке документа.</p>
            <p className='font-mono'>{e.error.message}</p>
        </Alert>;

    return <article className='flex flex-col gap-2'>
        <input ref={name} type='text' defaultValue={doc.name} readOnly={!editable}
               className='p-2 text-6xl font-bold h-20 outline-none w-full'/>
        <Textarea ref={description} defaultValue={doc.description} readOnly={!editable}
                  placeholder={editable ? 'Описание...' : undefined}
                  className='px-4 md:text-xl text-xl outline-none w-full border-0 shadow-none resize-none'/>
        {(synced && editor) ?
            <CatchBoundary getResetKey={() => 'doc-body-' + doc.id} errorComponent={errorComponent}>
                <BlockNoteView
                    className='w-full bg-background'
                    style={{
                        '--bn-colors-editor-background': 'var(--background)',
                        '--bn-colors-editor-text': 'var(--foreground)'
                    } as CSSProperties}
                    editor={editor}
                    editable={editable}
                    formattingToolbar={false}>
                    <Toolbar />
                </BlockNoteView>
            </CatchBoundary> :
            <Loading className='mx-auto' />}
    </article>
}