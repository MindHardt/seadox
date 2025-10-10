import {SeadocModel} from "seadox-shared/api";
import {CSSProperties, useEffect, useRef} from "react";
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
import "./seadoc.css";
import Loading from "@/components/loading.tsx";
import {useQuery} from "@tanstack/react-query";
import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";
import {canEdit} from "@/routes/docs/-utils.ts";

export default function Seadoc({ doc, editor, provider } : {
    doc: SeadocModel,
    editor: ReturnType<typeof useSeadoxEditor>,
    provider?: HocuspocusProvider
}) {
    const { data: user } = useQuery({
        ...CurrentUserOptions(),
        select: data => data?.user
    })

    const name = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);

    useTextareaBinding(name, 'name', provider);
    useTextareaBinding(description, 'description', provider);

    const synced = useProviderSync(provider);
    useEffect(() => {
        if (provider) {
            (async () => {
                console.log('connecting to provider', provider);
                provider.connect();
                console.log('connected to provider', provider);
            })();
        }
    }, [provider]);

    const editable = synced && canEdit(user, doc);

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
                        '--bn-colors-editor-background': 'var(--color-background)',
                        '--bn-colors-editor-text': 'var(--color-foreground)'
                    } as CSSProperties}
                    editor={editor}
                    editable={editable}>
                </BlockNoteView>
            </CatchBoundary> :
            <Loading className='mx-auto' />}
    </article>
}