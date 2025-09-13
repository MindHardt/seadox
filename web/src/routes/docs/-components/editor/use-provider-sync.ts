import {HocuspocusProvider} from "@hocuspocus/provider";
import {useCallback, useEffect, useState} from "react";


export default function useProviderSync(provider?: HocuspocusProvider) {
    const [synced, setSynced] = useState(false);

    const markSynced = useCallback(() => {
        console.log('synced with provider', provider);
        setSynced(true);
    }, []);
    useEffect(() => {
        if (!provider) {
            return;
        }

        provider.on('synced', markSynced);
        return () => {
            provider.off('synced', markSynced);
        }
    }, [provider]);

    return synced;
}