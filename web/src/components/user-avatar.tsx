import {User} from "@/routes/-auth/get-current-user.ts";
import {AvatarFallbackProps, AvatarImageProps, AvatarProps} from "@radix-ui/react-avatar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {cn} from "@/lib/utils.ts";


export default function UserAvatar({ user, imageProps, fallbackProps, className, ...props } : {
    user: User,
    imageProps?: AvatarImageProps,
    fallbackProps?: AvatarFallbackProps,
} & AvatarProps) {
    const fallback = user.name
        .split(' ', 2)
        .map(x => x[0]?.toUpperCase())
        .join('');

    return <Avatar className={cn('border-2', className)} style={{ borderColor: user.color }} {...props}>
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} {...imageProps} />}
        <AvatarFallback {...fallbackProps}>{fallback}</AvatarFallback>
    </Avatar>
}