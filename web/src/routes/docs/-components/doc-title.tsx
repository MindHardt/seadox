import {useEffect, useRef} from "react";
import {TextAreaBinding} from "y-textarea";
import {HocuspocusProvider} from "@hocuspocus/provider";
import DocControls from "@/routes/docs/-components/doc-controls";
import { SeadocContext } from "./doc-view";
import {useProviderSync} from "@/routes/docs/-components/use-provider-sync";

export default function DocTitle({ doc, provider } : {
    doc: SeadocContext,
    provider: HocuspocusProvider
}) {
    const input = useRef(null);
    const bind = useRef<TextAreaBinding>(null);
    const synced = useProviderSync(provider);

    useEffect(() => {
        const resizeInput = () => bind.current?.rePositionCursors();
        window.addEventListener('resize', resizeInput);
        return () => {
            window.removeEventListener('resize', resizeInput);
        };
    });
    useEffect(() => {
        if (!input.current || !synced) {
            return;
        }

        bind.current?.destroy();
        bind.current = new TextAreaBinding(provider.document.getText('name'), input.current, {
            awareness: provider.awareness!
        });
    }, [input, synced, doc.id]);

    return <div className='flex flex-row gap-1 w-full break-normal'>
        {<input
            id={'doc-' + doc.id + '-name'}
            type='text'
            ref={input}
            defaultValue={doc.name}
            readOnly={!(synced && doc.editable)}
            className='p-2 text-4xl h-15 outline-none w-full'
        />}
        {synced && doc.editable && <DocControls doc={doc} provider={provider} />}
    </div>
}