import {useQuery} from "@tanstack/react-query";
import {getCurrentUserFn} from "@/routes/-auth/actions";

export default function useAuth() {
    const queryKey = ['auth'];
    const { data: user, ...query } = useQuery({
        queryKey,
        queryFn: getCurrentUserFn
    });

    return {
        user,
        ...query
    }
}