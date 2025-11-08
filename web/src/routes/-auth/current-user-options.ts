import {queryOptions} from "@tanstack/react-query";
import {Route as RootRoute} from "@/routes/__root.tsx";
import {AuthenticationResult, getCurrentUser} from "@/routes/-auth/get-current-user.ts";

const queryKey = ['auth'] as const;
function currentUserOptions() {
    return queryOptions<AuthenticationResult | null>({
        queryKey,
        queryFn: getCurrentUser,
        initialData: RootRoute.useRouteContext().auth,
        staleTime: 30 * 1000,
    })
}
currentUserOptions.queryKey = queryKey;
export default currentUserOptions;