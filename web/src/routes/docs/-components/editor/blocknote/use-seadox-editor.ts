import {HocuspocusProvider} from "@hocuspocus/provider";
import {useQuery} from "@tanstack/react-query";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {codeBlock} from "@/routes/docs/-components/editor/blocknote/codeblock.ts";
import {postUploads} from "seadox-shared/api";
import uploadPath from "@/routes/-backend/upload-path.ts";
import {useMemo} from "react";
import {BlockNoteEditor} from "@blocknote/core";

export type SeadoxEditor = Exclude<ReturnType<typeof useSeadoxEditor>, null>;
export default function useSeadoxEditor(provider?: HocuspocusProvider) {
    const { data: user } = useQuery({
        ...currentUserOptions(),
        select: data => data?.user
    });

    return useMemo(() => provider ? BlockNoteEditor.create({
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
            const {data, error} = await postUploads({body: {File: file, Scope: "Attachment"}});
            if (!data) {
                throw error;
            }

            return uploadPath(data);
        }
    }) : null, [provider]);
}