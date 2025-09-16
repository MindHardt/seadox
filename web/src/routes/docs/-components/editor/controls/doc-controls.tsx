import {SeadocModel} from "seadox-shared/api";
import BookmarkButton from "@/routes/docs/-components/editor/controls/bookmark-button.tsx";
import DeleteDocButton from "@/routes/docs/-components/editor/controls/delete-doc-button.tsx";
import ExportButton from "@/routes/docs/-components/editor/controls/export-button.tsx";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";
import VisibilityButton from "@/routes/docs/-components/editor/controls/visilibity-button.tsx";
import ImportButton from "@/routes/docs/-components/editor/controls/import-button.tsx";
import {HocuspocusProvider} from "@hocuspocus/provider";


export default function DocControls({ doc, editor, provider } : {
    doc: SeadocModel,
    editor: ReturnType<typeof useSeadoxEditor>,
    provider?: HocuspocusProvider
}) {

    return <div className='grid grid-cols-3 gap-2 auto-rows-min'>
        <BookmarkButton doc={doc} />
        <DeleteDocButton doc={doc} />
        <ExportButton doc={doc} editor={editor} provider={provider} />
        <VisibilityButton doc={doc} />
        <ImportButton editor={editor} />
    </div>
}