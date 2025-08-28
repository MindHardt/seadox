import AuthOptions from "@/routes/api/-auth/auth-options.ts";
import Logo from "@/routes/-layout/logo.tsx";
import SignInButton from "@/routes/api/-auth/sign-in-button.tsx";
import UserSidebar from "@/routes/api/-auth/user-sidebar.tsx";
import {useQuery} from "@tanstack/react-query";


export default function Header() {
    const { data } = useQuery(AuthOptions());
    const user = data?.user;

    return <header className='p-2 flex flex-row gap-2 justify-between'>
        <Logo className='size-9' />

        {user ? <UserSidebar /> : <SignInButton />}
    </header>

}