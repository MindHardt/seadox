import {useQuery} from "@tanstack/react-query";
import {createServerFn} from "@tanstack/react-start";
import {getSupabaseServerClient} from "@/utils/supabase";

const getUserFn = createServerFn().handler(async () => {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        avatar: user.user_metadata['avatar_url'] as string | undefined,
        username: user.user_metadata['username'] as string | undefined,
        meta: user.user_metadata,
        email: user.email
    }
})

export default function useAuth() {
    const queryKey = ['auth'];
    const { data: user, ...query } = useQuery({
        queryKey,
        queryFn: getUserFn
    });

    return {
        user,
        ...query
    }
}