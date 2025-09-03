import {queryOptions} from "@tanstack/react-query";
import {Route as RootRoute} from "@/routes/__root.tsx";
import {getCurrentUser} from "@/routes/-auth/get-current-user.ts";

const queryKey = ['auth'] as const;
function CurrentUserOptions() {
    return queryOptions({
        queryKey,
        queryFn: getCurrentUser,
        initialData: RootRoute.useRouteContext().auth,
        staleTime: 60
    })
}
CurrentUserOptions.queryKey = queryKey;
export default CurrentUserOptions;