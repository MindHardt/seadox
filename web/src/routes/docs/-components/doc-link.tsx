import { Seadoc } from "../-types";
import {Link} from "@tanstack/react-router";
import {AnchorHTMLAttributes, ReactNode} from "react";

export default function DocLink({ doc, children, ...props } : {
    doc: Seadoc,
    children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
    const { id } = doc;
    return <Link to={'/docs/$id'} params={{ id }} {...props}>
        {children}
    </Link>
}
