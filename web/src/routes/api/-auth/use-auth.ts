import { useQuery } from "@tanstack/react-query";
import {Route as RootRoute} from "@/routes/__root";
import {getCurrentUser} from "@/routes/api/-auth/get-current-user.ts";
import {backendClient} from "@/routes/api/-auth/backend.ts";

export function useAuth() {
    const { data, ...rest } = useQuery({
        queryKey: ['auth'],
        queryFn: getCurrentUser,
        initialData: RootRoute.useRouteContext().auth,
        staleTime: 60
    });

    return {
        backend: () => backendClient(data?.accessToken),
        ...data,
        ...rest
    }
}