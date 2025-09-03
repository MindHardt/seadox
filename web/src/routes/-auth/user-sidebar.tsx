import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet.tsx";
import UserAvatar from "@/components/user-avatar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {redirect} from "@tanstack/react-router";
import {createServerFn, useServerFn} from "@tanstack/react-start";
import {z} from "zod";
import {clearTokens} from "@/routes/-auth/persistence.ts";
import {DoorClosed} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import BetterFileInput from "@/components/better-file-input.tsx";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import {useCallback} from "react";
import backendClient from "@/routes/-auth/backend-client.ts";
import {patchUsersMe, postUploads} from "seadox-shared/api";

const logoutFn = createServerFn({ method: 'POST' })
    .validator(z.object({ returnUrl: z.url() }))
    .handler(async ({ data }) => {
        clearTokens();
        throw redirect({ href: data.returnUrl });
    });

export default function UserSidebar() {
    const logout = useServerFn(logoutFn);

    const { data, refetch } = useQuery(CurrentUserOptions());
    const user = data?.user;
    const updateAvatar = useCallback(async (files: File[]) => {
        const file = files[0];
        if (!file) {
            return;
        }

        const accessToken = data?.accessToken;
        if (!accessToken) {
            return;
        }
        const client = backendClient(accessToken);
        const { data: uploadResult, error } = await postUploads({ client, body: { File: file, Scope: "Avatar" } });
        if (!uploadResult) {
            throw error;
        }
        const imageUrl = client.getConfig().baseUrl + '/uploads/' + uploadResult.id;
        await patchUsersMe({ client, body: { avatarUrl: imageUrl }});
        await refetch();

    }, [data?.accessToken])

    if (!user) {
        throw new Error('Cannot render UserSidebar for unauthenticated user.');
    }

    return <Sheet>
        <SheetTrigger asChild>
            <div role='button' className='flex flex-row gap-1 items-center'>
                <UserAvatar user={user} />
                <Button className='none md:block'>{user.name}</Button>
            </div>
        </SheetTrigger>
        <SheetContent side='right'>
            <SheetHeader>
                <SheetTitle>Управление аккаунтом</SheetTitle>
            </SheetHeader>
            <div className='flex flex-col gap-3'>
                <div className='flex flex-col gap-1 border rounded p-2 m-2'>
                    <AspectRatio ratio={1}>
                        <UserAvatar user={user} className='size-full rounded-sm'
                                    fallbackProps={{ className: 'rounded-sm text-5xl' }}
                                    imageProps={{ className: 'rounded-sm' }}/>
                    </AspectRatio>
                    <BetterFileInput accept='image/*' onUpload={updateAvatar} />
                </div>
            </div>
            <SheetFooter>
                <Button onClick={() => logout({ data: { returnUrl: window.location.href }})}>
                    <DoorClosed />
                    Выйти
                </Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
}