import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet.tsx";
import UserAvatar from "@/components/user-avatar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link, redirect} from "@tanstack/react-router";
import {createServerFn, useServerFn} from "@tanstack/react-start";
import {z} from "zod";
import {clearTokens, retrieveTokens} from "@/routes/-auth/persistence.ts";
import {DoorClosed, ExternalLink} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import BetterFileInput from "@/components/better-file-input.tsx";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import {useCallback} from "react";
import {patchUsersMe, PatchUsersMeData, postUploads} from "seadox-shared/api";
import UserColorPicker from "@/routes/-auth/user-color-picker.tsx";
import uploadPath from "@/routes/-backend/upload-path.ts";
import {zitadel} from "@/routes/-auth/zitadel.ts";

const logoutFn = createServerFn({ method: 'POST' })
    .validator(z.object({ returnUrl: z.url() }))
    .handler(async ({ data }) => {
        const { refresh_token } = retrieveTokens();
        if (refresh_token) {
            await zitadel.revokeTokens({ refreshToken: refresh_token });
        }
        clearTokens();
        throw redirect({ href: data.returnUrl });
    });

export default function UserSidebar() {
    const logout = useServerFn(logoutFn);

    const { data, refetch } = useQuery(currentUserOptions());

    const user = data?.user;
    const updateUser = useCallback(async (body: PatchUsersMeData['body']) => {
        await patchUsersMe({ body });
        await refetch();
    }, []);

    const updateAvatar = useCallback(async (files: File[]) => {
        const file = files[0];
        if (!file) {
            return;
        }

        const { data: uploadResult, error } = await postUploads({ body: { File: file, Scope: "Avatar" } });
        if (!uploadResult) {
            throw error;
        }
        const avatarUrl = uploadPath(uploadResult);
        await updateUser({ avatarUrl });

    }, []);

    if (!user) {
        throw new Error('Cannot render UserSidebar for unauthenticated user.');
    }

    const zitadelUrl = import.meta.env.VITE_ZITADEL_URL as string;
    return <Sheet>
        <SheetTrigger asChild>
            <div role='button' className='flex flex-row gap-1 items-center'>
                <UserAvatar user={user} />
                <Button className='hidden md:block'>{user.name}</Button>
            </div>
        </SheetTrigger>
        <SheetContent side='right'>
            <SheetHeader>
                <SheetTitle>Управление аккаунтом</SheetTitle>
            </SheetHeader>
            <div className='flex flex-col gap-2 px-2'>
                <div className='flex flex-col gap-1 border rounded p-2 mx-2'>
                    <AspectRatio ratio={1}>
                        <UserAvatar user={user} className='size-full rounded-sm border-0'
                                    fallbackProps={{ className: 'rounded-sm text-5xl' }}
                                    imageProps={{ className: 'rounded-sm' }}/>
                    </AspectRatio>
                    <BetterFileInput accept='image/*' onUpload={updateAvatar} />
                </div>
                <UserColorPicker
                    className='grid-cols-6 border rounded p-2 mx-2'
                    onSelected={color => updateUser({ color })} />
                <div className='px-2'>
                    {zitadelUrl && <Link to={zitadelUrl}>
                        <Button variant='outline' className='w-full'>
                            Настроить
                            <ExternalLink />
                        </Button>
                    </Link>}
                </div>
                {user.roles.length !== 0 && <div className='flex flex-col gap-1 border rounded p-2 mx-2'>
                    <h3 className='text-center text-xl'>Роли</h3>
                    {user.roles.map(r => <span className='font-mono font-bold' key={r}>{r}</span>)}
                </div>}
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