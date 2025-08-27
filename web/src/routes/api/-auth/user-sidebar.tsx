import {useAuth} from "@/routes/api/-auth/use-auth.ts";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import UserAvatar from "@/components/user-avatar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {redirect} from "@tanstack/react-router";
import {createServerFn, useServerFn} from "@tanstack/react-start";
import {z} from "zod";
import {clearTokens} from "@/routes/api/-auth/persistence.ts";
import {DoorClosed} from "lucide-react";

const logoutFn = createServerFn({ method: 'POST' })
    .validator(z.object({ returnUrl: z.url() }))
    .handler(async ({ data }) => {
        clearTokens();
        throw redirect({ href: data.returnUrl });
    });

export default function UserSidebar() {
    const logout = useServerFn(logoutFn);

    const { backend, user } = useAuth();
    if (!user) {
        throw new Error('Cannot render UserSidebar for unauthenticated user.');
    }

    return <Sheet>
        <SheetTrigger asChild>
            <div role='button' className='flex flex-row gap-1'>
                <UserAvatar user={user} />
                <Button className='none md:block'>{user.name}</Button>
            </div>
        </SheetTrigger>
        <SheetContent side='right'>
            <SheetHeader>
                <SheetTitle>Управление аккаунтом</SheetTitle>
            </SheetHeader>
            <SheetFooter>
                <Button onClick={() => logout({ data: { returnUrl: window.location.href }})}>
                    <DoorClosed />
                    Выйти
                </Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
}