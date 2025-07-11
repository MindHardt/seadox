import {HocuspocusProvider} from "@hocuspocus/provider";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {useCreateBlockNote} from "@blocknote/react";
import {BlockNoteView} from "@blocknote/shadcn";
import {rootRoute} from "@/routes/__root";
import {randomColor} from "@/routes/-auth/actions";
import { SeadocContext } from "./doc-view";
import {uploadFileFn} from "@/routes/docs/-actions";

export default function DocBody({ doc, provider } : {
    doc: SeadocContext,
    provider : HocuspocusProvider
}) {

    const { user } = rootRoute.useRouteContext();
    // noinspection JSUnusedGlobalSymbols
    const editor = useCreateBlockNote({
        collaboration: {
            fragment: provider.document.getXmlFragment('blocks'),
            provider,
            user: user.success ? {
                name: user.value.name,
                color: user.value.color
            } : {
                name: 'ANON',
                color: randomColor()
            }
        },
        uploadFile: async (file) => {
            const form = new FormData();
            form.append('file', file);

            const result = await uploadFileFn({ data: form });
            if (!result.success)
            {
                throw new Error(result.error);
            }

            return result.value;
        }
    }, [doc.id]);

    return <BlockNoteView
        style={{ '--background': 'var(--color-background)', '--foreground': 'var(--color-foreground)' } as React.CSSProperties}
        editor={editor}
        editable={doc.editable} />;
}