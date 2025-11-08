import {GetIndexResponse} from "seadox-shared/api";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar.tsx";
import {Link} from "@tanstack/react-router";
import {FileCode2, Plus, Star} from "lucide-react";
import CreateDocDialog from "@/routes/docs/-components/create-doc-dialog.tsx";
import {DialogTrigger} from "@/components/ui/dialog.tsx";


export default function SidebarIndex({ data } : {
    data: GetIndexResponse
}) {

    return <>
        <SidebarGroup>
            <SidebarGroupLabel>Ваши документы</SidebarGroupLabel>
            <SidebarMenu>
                <CreateDocDialog parentId={null}>
                    <DialogTrigger asChild>
                        <SidebarMenuButton>
                            <Plus />
                            <span className='text-2xl'>Создать</span>
                        </SidebarMenuButton>
                    </DialogTrigger>
                </CreateDocDialog>
                {data.root.map(x =>
                    <Link key={x.id} className='flex flex-row items-center' to='/docs/$id' params={{ id: x.id! }}>
                        <SidebarMenuButton key={x.id}>
                            <FileCode2 />
                            <span className='text-2xl'>{x.name}</span>
                        </SidebarMenuButton>
                    </Link>)}
            </SidebarMenu>
        </SidebarGroup>
        {data.bookmarks.length > 0 && <SidebarGroup>
            <SidebarGroupLabel>Избранное</SidebarGroupLabel>
            <SidebarMenu>
                {data.bookmarks.map(x =>
                    <Link key={x.id} className='flex flex-row items-center' to='/docs/$id' params={{ id: x.id! }}>
                        <SidebarMenuButton>
                            <Star fill='' />
                            <span className='text-2xl'>{x.name}</span>
                        </SidebarMenuButton>
                    </Link>)}
            </SidebarMenu>
        </SidebarGroup>}
    </>
}