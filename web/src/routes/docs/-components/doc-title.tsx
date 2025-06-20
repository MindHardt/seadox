import {useEffect, useRef} from "react";
import {TextAreaBinding} from "y-textarea";
import {HocuspocusProvider} from "@hocuspocus/provider";
import {rootRoute} from "@/routes/__root";
import DocControls from "@/routes/docs/-components/doc-controls";
import { SeadocContext } from "./doc-view";

export default function DocTitle({ doc, provider } : {
    doc: SeadocContext,
    provider: HocuspocusProvider
}) {
    const yDoc = provider.document;
    const nameSection = yDoc.getText('name');

    const { user } = rootRoute.useRouteContext();
    const nameInput = useRef(null);
    const bind = useRef<TextAreaBinding>(null);

    useEffect(() => {
        const resizeNameInput = () => bind.current?.rePositionCursors();
        window.addEventListener('resize', resizeNameInput);
        return () => {
            window.removeEventListener('resize', resizeNameInput);
        };
    });
    useEffect(() => {
        if (!nameInput.current) {
            return;
        }
        bind.current?.destroy();
        bind.current = new TextAreaBinding(nameSection, nameInput.current, {
            awareness: provider.awareness!
        });
    }, [nameInput, yDoc]);

    return <div className='flex flex-row gap-1 w-full'>
        <input
            id={'docname-' + doc.id}
            type='text'
            ref={nameInput}
            defaultValue={doc.name}
            readOnly={!doc.editable}
            className='p-2 text-4xl h-15 outline-none w-full'
        />
        {doc.editable && <DocControls doc={doc} />}
    </div>
}