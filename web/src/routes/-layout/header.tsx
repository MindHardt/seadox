import AuthOptions from "@/routes/-auth/auth-options.ts";
import Logo from "@/routes/-layout/logo.tsx";
import SignInButton from "@/routes/-auth/sign-in-button.tsx";
import UserSidebar from "@/routes/-auth/user-sidebar.tsx";
import {useQuery} from "@tanstack/react-query";


export default function Header() {
    const { data } = useQuery(AuthOptions());
    const user = data?.user;

    return <header className='p-2 flex flex-row gap-2 justify-between'>
        <Logo className='size-9' />

        {user ? <UserSidebar /> : <SignInButton />}
    </header>

}