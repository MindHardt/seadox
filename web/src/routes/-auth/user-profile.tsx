import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {rootRoute} from "@/routes/__root";
import UserAvatar from "@/components/user-avatar";
import {Button} from "@/components/ui/button";
import {DoorClosed} from "lucide-react";
import {useServerFn} from "@tanstack/react-start";
import {logoutFn} from "@/routes/-auth/actions";


export default function UserProfile() {
    const { user } = rootRoute.useRouteContext();
    const logout = useServerFn(logoutFn);

    if (!user.authenticated) {
        return;
    }

    return <Sheet>
        <SheetTrigger asChild>
            <div className='flex flex-row gap-1'>
                <UserAvatar user={user} />
                <Button className='hidden md:inline'>{user.name}</Button>
            </div>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>{user.name}</SheetTitle>
            </SheetHeader>
            <div className='flex flex-col gap-2'>

            </div>
            <SheetFooter>
                <Button variant='secondary' onClick={() => logout({ data: { returnUrl: window.location.href }})}>
                    <DoorClosed />
                    Выйти
                </Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
}