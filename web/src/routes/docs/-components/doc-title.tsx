import {useEffect, useRef} from "react";
import {TextAreaBinding} from "y-textarea";
import {HocuspocusProvider} from "@hocuspocus/provider";
import DocControls from "@/routes/docs/-components/doc-controls";
import { SeadocContext } from "./doc-view";
import {useProviderSync} from "@/routes/docs/-components/use-provider-sync";
import {Skeleton} from "@/components/ui/skeleton";

export default function DocTitle({ doc, provider } : {
    doc: SeadocContext,
    provider: HocuspocusProvider
}) {
    const yDoc = provider.document;
    const nameSection = yDoc.getText('name');

    const nameInput = useRef(null);
    const bind = useRef<TextAreaBinding>(null);
    const synced = useProviderSync(provider);

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

    return <div className='flex flex-row gap-1 w-full break-normal'>
        {synced ? <input
            id={'docname-' + doc.id}
            type='text'
            ref={nameInput}
            defaultValue={doc.name}
            readOnly={!doc.editable}
            className='p-2 text-4xl h-15 outline-none w-full'
        /> : <Skeleton className='h-15 w-full' />}
        {synced && doc.editable && <DocControls doc={doc} />}
    </div>
}