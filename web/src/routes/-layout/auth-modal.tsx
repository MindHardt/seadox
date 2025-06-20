import {rootRoute} from "@/routes/__root";
import SignInDialog from "@/routes/-auth/sign-in-dialog";
import UserProfile from "@/routes/-auth/user-profile";


export default function AuthModal() {
    const { user } = rootRoute.useRouteContext();
    if (user.authenticated) {
        return <UserProfile />
    } else {
        return <SignInDialog />
    }
}