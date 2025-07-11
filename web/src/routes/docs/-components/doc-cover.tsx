import {SeadocContext} from "@/routes/docs/-components/doc-view";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {useProviderSync} from "@/routes/docs/-components/use-provider-sync";
import { useEffect, useState } from "react";


export default function DocCover({ doc, provider } : {
    doc: SeadocContext,
    provider: HocuspocusProvider
}) {
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const synced = useProviderSync(provider);

    useEffect(() => {
        const coverField = provider.document.getText('cover');
        coverField.observe(e => {
            setCoverUrl(e.target.toString());
        });
        setCoverUrl(coverField.toString());
    }, [provider]);

    const src = synced ? coverUrl : doc.coverUrl;
    if (src) {
        return <img src={src} alt='Document cover' className='w-full rounded-md' />
    }
}