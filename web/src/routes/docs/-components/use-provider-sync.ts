import { HocuspocusProvider } from "@hocuspocus/provider";
import {useEffect, useState } from "react";

export function useProviderSync(provider: HocuspocusProvider) {
    const [synced, setSynced] = useState(false);
    const markSynced = () => setSynced(true);

    useEffect(() => {
        provider.on('synced', markSynced);
        return () => {
            provider.off('synced', markSynced);
        };
    }, []);

    return synced;
}