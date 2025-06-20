import {HocuspocusProvider} from "@hocuspocus/provider";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {useCreateBlockNote} from "@blocknote/react";
import {BlockNoteView} from "@blocknote/shadcn";
import {createServerFn} from "@tanstack/react-start";
import {getSupabaseServerClient} from "@/utils/supabase";
import * as path from "node:path";
import {rootRoute} from "@/routes/__root";
import {randomColor} from "@/routes/-auth/actions";
import { SeadocContext } from "./doc-view";

const uploadFileFn = createServerFn({ method: "POST" })
    .validator((data : FormData) => data)
    .handler(async ({ data }) => {
        const file = [...data.values()].pop() as File;
        const filename = crypto.randomUUID() + path.extname(file.name);

        const supabase = getSupabaseServerClient();
        const {error} = await supabase.storage
            .from('attachments')
            .upload(filename, file);
        if (error) {
            throw error;
        }
        return {
            url: supabase.storage.from('attachments').getPublicUrl(filename).data.publicUrl
        }
    });

export default function DocBody({ doc, provider } : {
    doc: SeadocContext,
    provider : HocuspocusProvider
}) {

    const { user } = rootRoute.useRouteContext();
    const editor = useCreateBlockNote({
        collaboration: {
            fragment: provider.document.getXmlFragment('blocks'),
            provider,
            user: user.authenticated ? {
                name: user.name,
                color: user.color
            } : {
                name: 'ANON',
                color: randomColor()
            }
        },
        uploadFile: async (file) => {
            const form = new FormData();
            form.append('file', file);

            const { url } = await uploadFileFn({ data: form });
            return url;
        }
    }, [doc.id]);

    return <BlockNoteView editor={editor} editable={doc.editable} />
}