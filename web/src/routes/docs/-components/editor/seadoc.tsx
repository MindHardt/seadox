import {postUploads, SeadocModel} from "seadox-shared/api";
import {CSSProperties, useEffect, useRef} from "react";
import useTextareaBinding from "@/routes/docs/-components/editor/use-textarea-binding.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import useProvider from "@/routes/docs/-components/editor/use-provider.ts";
import {HocuspocusProvider} from "@hocuspocus/provider";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import {CatchBoundary, ErrorComponentProps} from "@tanstack/react-router";
import {Alert} from "@/components/ui/alert.tsx";
import {Bug, ImageUp, Trash} from "lucide-react";
import {BlockNoteView} from "@blocknote/shadcn";

import Loading from "@/components/loading.tsx";
import Toolbar from "@/routes/docs/-components/editor/blocknote/toolbar.tsx";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./seadoc.css";
import useYText from "@/routes/docs/-components/editor/use-y-text.ts";
import {Button} from "@/components/ui/button.tsx";
import BetterFileInput from "@/components/better-file-input.tsx";
import {client} from "@/routes/-backend/backend-client.ts";
import uploadPath from "@/routes/-backend/upload-path.ts";

export default function Seadoc({ doc, editor, provider } : {
    doc: SeadocModel,
    editor: ReturnType<typeof useSeadoxEditor>,
    provider?: HocuspocusProvider
}) {

    const name = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);

    useTextareaBinding(name, 'name', provider);
    useTextareaBinding(description, 'description', provider);
    const [coverUrl, setCoverUrl] = useYText(provider?.document, 'coverUrl', doc.coverUrl ?? undefined);

    const uploadCover = (files: File[]) => {
        if (files.length > 0) {
            postUploads({ client, throwOnError: true, body: {
                    File: files.pop()!,
                    Scope: 'Attachment'
                }}).then(x => setCoverUrl(uploadPath(x.data)))
        }
    }

    const { synced, scope } = useProvider(provider);
    useEffect(() => {
        if (provider) {
            (async () => {
                await provider.connect();
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
        <div className={'w-full relative rounded overflow-hidden ' + (coverUrl.length > 0 ? 'h-60' : 'h-10')}>
            {coverUrl.length > 0 && <div className='size-full flex justify-center'>
                <div className='h-full shadow-lg z-1 bg-background'>
                    <img src={coverUrl} alt='cover' className='h-full'/>
                </div>
                <img src={coverUrl} alt='blurred cover' className='blur w-full absolute top-0 opacity-50 z-0' />
            </div>}
            <div className={'absolute bottom-1 end-1 flex flex-col gap-1' + (editable ? '' : ' hidden')}>
                <BetterFileInput accept='image/*' multiple={false} buttonLabel={() => <ImageUp />} onUpload={uploadCover} />
                {coverUrl.length > 0 &&
                    <Button className='w-full' size='icon' variant='destructive' onClick={() => setCoverUrl('')}>
                        <Trash />
                    </Button>}
            </div>
        </div>
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