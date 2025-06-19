import { Seadoc } from "../-types/Seadoc";
import {Link} from "@tanstack/react-router";


export async function DocLink({ doc } : {
    doc: Seadoc
}) {
    const { id } = doc
    return <Link to={'/docs/$id'} params={{ id }} className='p-2 bg-slate-500 rounded text-accent-foreground'>
        {doc.name}
    </Link>
}