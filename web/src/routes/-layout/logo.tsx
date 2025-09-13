import {ComponentProps} from "react";
import {Link} from "@tanstack/react-router";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";


export default function Logo(props : ComponentProps<typeof Link>) {

    return <Link to='/' {...props}>
        <AspectRatio ratio={1}>
            <img src='/logo192.png' alt='Seadox Logo' />
        </AspectRatio>
    </Link>
}