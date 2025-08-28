import {User} from "@/routes/api/-auth/get-current-user.ts";
import {AvatarFallbackProps, AvatarImageProps, AvatarProps} from "@radix-ui/react-avatar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";


export default function UserAvatar({ user, imageProps, fallbackProps, ...props } : {
    user: User,
    imageProps?: AvatarImageProps,
    fallbackProps?: AvatarFallbackProps,
} & AvatarProps) {
    const fallback = user.name
        .split(' ', 2)
        .map(x => x[0]?.toUpperCase())
        .join('');

    return <Avatar {...props}>
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} {...imageProps} />}
        <AvatarFallback {...fallbackProps}>{fallback}</AvatarFallback>
    </Avatar>
}