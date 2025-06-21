import {useEffect, useRef} from "react";
import {TextAreaBinding} from "y-textarea";
import {HocuspocusProvider} from "@hocuspocus/provider";
import { SeadocContext } from "./doc-view";
import {useProviderSync} from "@/routes/docs/-components/use-provider-sync";
import { Textarea } from "@/components/ui/textarea";

export default function DocDescription({ doc, provider } : {
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
        bind.current = new TextAreaBinding(provider.document.getText('description'), input.current, {
            awareness: provider.awareness!
        });
    }, [input, synced, doc.id]);

    return <Textarea
        id={'doc-' + doc.id + '-description'}
        ref={input}
        defaultValue={doc.description}
        readOnly={!(synced && doc.editable)}
        className='px-4 md:text-xl text-xl outline-none w-full border-0 shadow-none resize-none'
        placeholder='Описание...'/>
}