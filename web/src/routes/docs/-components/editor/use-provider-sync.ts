import {HocuspocusProvider} from "@hocuspocus/provider";
import {useCallback, useEffect, useState} from "react";


export default function useProviderSync(provider?: HocuspocusProvider) {
    const [synced, setSynced] = useState(false);

    const markSynced = useCallback(() => {
        console.log('synced with provider', provider);
        setSynced(true);
    }, [provider]);
    const markUnsynced = useCallback(() => {
        console.log('disconnected from provider', provider);
        setSynced(false);
    }, [provider]);

    useEffect(() => {
        if (!provider) {
            return;
        }

        provider.on('synced', markSynced);
        provider.on('disconnect', markUnsynced);
        return () => {
            provider.off('synced', markSynced);
            provider.off('disconnect', markUnsynced);
        }
    }, [provider]);

    return synced;
}