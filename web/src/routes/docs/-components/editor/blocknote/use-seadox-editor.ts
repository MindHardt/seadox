import {HocuspocusProvider} from "@hocuspocus/provider";
import {useQuery} from "@tanstack/react-query";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {codeBlock} from "@/routes/docs/-components/editor/blocknote/codeblock.ts";
import {postUploads} from "seadox-shared/api";
import uploadPath from "@/routes/-backend/upload-path.ts";
import {useMemo} from "react";
import {BlockNoteEditor} from "@blocknote/core";
import {client} from "@/routes/-backend/backend-client.ts";
import {schema} from "@/routes/docs/-components/editor/blocknote/schema.ts";

export type SeadoxEditor = Exclude<ReturnType<typeof useSeadoxEditor>, null>;
export default function useSeadoxEditor(provider?: HocuspocusProvider) {
    const { data: user } = useQuery({
        ...currentUserOptions(),
        select: data => data?.user
    });

    return useMemo(() => provider ? BlockNoteEditor.create({
        codeBlock, schema,
        collaboration: {
            fragment: provider.document.getXmlFragment('blocks'),
            provider,
            user: user ?? {
                name: 'ANON',
                color: '#3aebca'
            }
        },
        uploadFile: async (file) => await postUploads({
            client,
            throwOnError: true,
            body: {
                File: file,
                Scope: "Attachment"
            }}).then(({ data }) => uploadPath(data))
    }) : null, [provider?.configuration.name]);
}