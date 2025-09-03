import {GetIndexResponse} from "seadox-shared/api";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar.tsx";
import {Link} from "@tanstack/react-router";
import {Bookmark, FileCode2, Plus} from "lucide-react";
import CreateDocDialog from "@/routes/docs/-components/create-doc-dialog.tsx";
import {DialogTrigger} from "@/components/ui/dialog.tsx";


export default function SidebarIndex({ data } : {
    data: GetIndexResponse
}) {

    return <>
        <SidebarGroup>
            <SidebarGroupLabel>Ваши документы</SidebarGroupLabel>
            <SidebarMenu>
                {data.root.map(x => <SidebarMenuButton key={x.id}>
                    <FileCode2 />
                    <Link className='flex flex-row items-center' to='/docs/$id' params={{ id: x.id! }}>
                        <span className='text-2xl'>{x.name}</span>
                    </Link>
                </SidebarMenuButton>)}
                <CreateDocDialog parentId={null}>
                    <DialogTrigger asChild>
                        <SidebarMenuButton>
                            <Plus />
                            <span className='text-2xl'>Создать</span>
                        </SidebarMenuButton>
                    </DialogTrigger>
                </CreateDocDialog>
            </SidebarMenu>
        </SidebarGroup>
        {data.bookmarks.length > 0 && <SidebarGroup>
            <SidebarGroupLabel>Избранное</SidebarGroupLabel>
            <SidebarMenu>
                {data.bookmarks.map(x => <SidebarMenuButton key={x.id}>
                    <Bookmark />
                    <Link className='flex flex-row items-center' to='/docs/$id' params={{ id: x.id! }}>
                        <span className='text-2xl'>{x.name}</span>
                    </Link>
                </SidebarMenuButton>)}
            </SidebarMenu>
        </SidebarGroup>}
    </>
}