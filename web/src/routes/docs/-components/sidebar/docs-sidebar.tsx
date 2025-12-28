import {
    Sidebar,
    SidebarContent, SidebarGroup,
    SidebarHeader, SidebarMenu, SidebarMenuButton,
} from "@/components/ui/sidebar.tsx";
import {useQuery} from "@tanstack/react-query";
import SidebarIndex from "@/routes/docs/-components/sidebar/sidebar-index.tsx";
import Loading from "@/components/loading.tsx";
import Logo from "@/routes/-layout/logo.tsx";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {Search} from "lucide-react";
import {Link} from "@tanstack/react-router";


export default function DocsSidebar() {

    const { data: docs } = useQuery({
       ...currentUserOptions(),
        select: data => data?.index
    });

    return docs && <Sidebar collapsible='icon'>
        <SidebarHeader>
            <div className='grid grid-cols-6'>
                <Logo className='size-9' />
                <span className='font-bold text-2xl group-data-[collapsible=icon]:hidden'>Seadox</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarMenu>
                    <Link to='/docs/search'>
                        <SidebarMenuButton>
                            <Search />
                            <span className='text-2xl'>Поиск</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenu>
            </SidebarGroup>
            { docs ? <SidebarIndex data={docs} /> : <Loading />}
        </SidebarContent>
    </Sidebar>
}