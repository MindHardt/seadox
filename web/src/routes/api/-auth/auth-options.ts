import {queryOptions} from "@tanstack/react-query";
import {Route as RootRoute} from "@/routes/__root";
import {getCurrentUser} from "@/routes/api/-auth/get-current-user.ts";

export default function AuthOptions() {
    return queryOptions({
        queryKey: ['auth'],
        queryFn: getCurrentUser,
        initialData: RootRoute.useRouteContext().auth,
        staleTime: 60
    })
}