import {SeadocModel} from "seadox-shared/api";
import BookmarkButton from "@/routes/docs/-components/editor/controls/bookmark-button.tsx";
import DeleteDocButton from "@/routes/docs/-components/editor/controls/delete-doc-button.tsx";


export default function DocControls({ doc } : {
    doc: SeadocModel
}) {

    return <div className='grid grid-cols-3 gap-2'>
        <BookmarkButton doc={doc} />
        <DeleteDocButton doc={doc} />
    </div>
}