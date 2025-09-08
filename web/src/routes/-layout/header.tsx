import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";
import Logo from "@/routes/-layout/logo.tsx";
import SignInButton from "@/routes/-auth/sign-in-button.tsx";
import UserSidebar from "@/routes/-auth/user-sidebar.tsx";
import {useQuery} from "@tanstack/react-query";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";


export default function Header() {
    const { data } = useQuery(CurrentUserOptions());
    const user = data?.user;

    return <header className='p-2 flex flex-row gap-2 shadow'>
        {user ? <SidebarTrigger className='size-9 -ml-1' /> : <Logo className='size-9' />}
        <div className='grow'></div>
        {user ? <UserSidebar /> : <SignInButton />}
    </header>

}