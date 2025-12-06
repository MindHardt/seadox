import {HocuspocusProvider} from "@hocuspocus/provider";
import {useCallback, useEffect, useState} from "react";
import {z} from "zod";

type UseProviderProps =
    { synced: false; scope?: undefined } |
    { synced: true, scope: z.infer<typeof zAuthorizedScope> }
const zAuthorizedScope = z.union([
    z.literal('read-write'),
    z.literal('readonly')
]);

export default function useProvider(provider?: HocuspocusProvider) {
    const [props, setProps] = useState<UseProviderProps>({ synced: false });

    const markSynced = useCallback(() => {
        console.log('synced with provider', provider);
        setProps({ synced: true, scope: zAuthorizedScope.parse(provider?.authorizedScope) })
    }, [provider]);
    const markUnsynced = useCallback(() => {
        console.log('disconnected from provider', provider);
        setProps({ synced: false })
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

    return props;
}