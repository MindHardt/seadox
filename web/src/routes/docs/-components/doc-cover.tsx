import {SeadocContext} from "@/routes/docs/-components/doc-view";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {useProviderSync} from "@/routes/docs/-components/use-provider-sync";
import { useEffect, useState } from "react";
import { MousePointerClick } from "lucide-react";


export default function DocCover({ doc, provider } : {
    doc: SeadocContext,
    provider: HocuspocusProvider
}) {
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const synced = useProviderSync(provider);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const coverField = provider.document.getText('cover');
        coverField.observe(e => {
            setCoverUrl(e.target.toString());
        });
        setCoverUrl(coverField.toString());
    }, [provider]);

    const src = synced ? coverUrl : doc.coverUrl;
    return src && <div
        className={'relative w-full rounded-md overflow-hidden transition-[max-height,filter] ease-in-out duration-500 ' + (expanded ? 'max-h-500' : 'max-h-25 md:max-h-50')}
        onClick={() => setExpanded(x => !x)}>
        <img src={src} alt='Document cover' className={'w-full object-cover object-top ' + (expanded ? 'blur-none' : 'blur-xs')} />
        <div className={'absolute top-2 right-2 bg-accent shadow rounded p-1 ' + (expanded ? 'opacity-50' : 'animate-pulse')}>
            <MousePointerClick />
        </div>
    </div>
}