import {useAuth} from "@/routes/api/-auth/use-auth.ts";
import Logo from "@/routes/-layout/logo.tsx";
import SignInButton from "@/routes/api/-auth/sign-in-button.tsx";
import UserSidebar from "@/routes/api/-auth/user-sidebar.tsx";


export default function Header() {
    const { user } = useAuth();

    return <header className='p-2 flex flex-row gap-2 justify-between'>
        <Logo className='size-9' />

        {user ? <UserSidebar /> : <SignInButton />}
    </header>

}