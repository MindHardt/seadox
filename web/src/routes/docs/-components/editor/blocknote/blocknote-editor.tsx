import {useCreateBlockNote} from "@blocknote/react";
import {codeBlock} from "@/routes/docs/-components/editor/blocknote/codeblock.ts";
import {HocuspocusProvider} from "@hocuspocus/provider";
import {useQuery} from "@tanstack/react-query";
import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";
import {postUploads, SeadocModel} from "seadox-shared/api";
import uploadPath from "@/routes/-backend/upload-path.ts";
import { CatchBoundary } from "@tanstack/react-router";
import { Alert } from "@/components/ui/alert";
import {Bug} from "lucide-react";
import {CSSProperties} from "react";
import {BlockNoteView} from "@blocknote/shadcn";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./blocknote.css";

export default function BlocknoteEditor({ doc, provider } : {
    doc: SeadocModel,
    provider: HocuspocusProvider
}) {

    const { data: user } = useQuery({
        ...CurrentUserOptions(),
        select: data => data?.user
    });

    const editor = useCreateBlockNote({
        codeBlock,
        collaboration: {
            fragment: provider.document.getXmlFragment('blocks'),
            provider,
            user: user ?? {
                name: 'ANON',
                color: '#3aebca'
            }
        },
        uploadFile: async (file) => {
            const { data, error } = await postUploads({ body: { File: file, Scope: "Attachment" }});
            if (!data) {
                throw error;
            }

            return uploadPath(data);
        }
    }, [provider]);

    return <CatchBoundary
        getResetKey={() => 'doc-body-' + doc.id}
        errorComponent={e => <Alert className='flex flex-col items-center gap-2' variant='destructive'>
            <Bug />
            <p className='font-extrabold'>Произошла ошибка при загрузке документа.</p>
            <p className='font-mono'>{e.error.message}</p>
        </Alert>}
    >
        <BlockNoteView
            className='w-full'
            style={{ '--background': 'var(--color-background)', '--foreground': 'var(--color-foreground)' } as CSSProperties}
            editor={editor}
            editable={doc.accessLevel === "Write"}>
        </BlockNoteView>
    </CatchBoundary>
}