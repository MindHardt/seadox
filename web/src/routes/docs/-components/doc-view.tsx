import {Seadoc} from "@/routes/docs/-types";
import {useMemo} from "react";
import {HocuspocusProvider} from "@hocuspocus/provider";
import DocTitle from "@/routes/docs/-components/doc-title";
import DocBody from "@/routes/docs/-components/doc-body";
import useBrowser from "@/hooks/use-browser";
import {rootRoute} from "@/routes/__root";
import DocDescription from "@/routes/docs/-components/doc-description";

export type SeadocContext = Seadoc & {
    editable: boolean
}

export function DocView({ doc } : {
    doc: Seadoc
}) {

    const { user } = rootRoute.useRouteContext();
    const isBrowser = useBrowser();

    const providerUrl = import.meta.env.VITE_WS_URL as string;
    if (!providerUrl) {
       throw new Error('PROVIDER URL NOT SET');
    }
    const provider = useMemo(() => new HocuspocusProvider({
        url: providerUrl,
        name: doc.id,
    }), [doc.id]);

    const docCtx: SeadocContext = {
        ...doc,
        editable: user.success && user.value.id === doc.ownerId
    }

    return <article className='flex flex-col gap-3 p-3 w-full sm:min-w-sm md:min-w-md xl:min-w-xl bg-background'>
        <DocTitle doc={docCtx} provider={provider} />
        <DocDescription doc={docCtx} provider={provider} />
        {isBrowser && <DocBody doc={docCtx} provider={provider} />}
    </article>
}