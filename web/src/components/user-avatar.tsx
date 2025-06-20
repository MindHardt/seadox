import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { UserData } from "@/routes/-auth/actions";


export default function UserAvatar({ user } : {
    user: UserData
}) {
    const abbr = (user.name)
        .split(' ', 2)
        .map(x => x[0].toUpperCase())
        .join('');
    return <Avatar>
        {user.avatar && <AvatarImage src={user.avatar} />}
        <AvatarFallback>{abbr}</AvatarFallback>
    </Avatar>
}