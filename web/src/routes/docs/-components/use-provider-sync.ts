import { HocuspocusProvider } from "@hocuspocus/provider";
import { useState } from "react";

export function useProviderSync(provider: HocuspocusProvider) {
    const [synced, setSynced] = useState(false);
    provider.on('synced', () => setSynced(true));

    return synced;
}