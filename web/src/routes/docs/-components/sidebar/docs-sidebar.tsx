import {
    Sidebar,
    SidebarContent, SidebarGroup,
    SidebarHeader, SidebarMenu, SidebarMenuButton,
} from "@/components/ui/sidebar.tsx";
import {useQuery} from "@tanstack/react-query";
import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";
import SidebarIndex from "@/routes/docs/-components/sidebar/sidebar-index.tsx";
import Loading from "@/components/loading.tsx";
import Logo from "@/routes/-layout/logo.tsx";
import {useState} from "react";
import DocSearchDialog from "@/routes/docs/-components/sidebar/doc-search-dialog.tsx";
import {Search} from "lucide-react";


export default function DocsSidebar() {

    const { data } = useQuery(CurrentUserOptions());
    const [searchOpen, setSearchOpen] = useState(false);

    if (!data) {
        return <></>;
    }

    return <Sidebar collapsible='icon'>
        <SidebarHeader>
            <div className='grid grid-cols-6'>
                <Logo className='size-9' />
                <span className='font-bold text-2xl group-data-[collapsible=icon]:hidden'>Seadox</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuButton onClick={() => setSearchOpen(true)}>
                        <Search />
                        <span className='text-2xl'>Поиск</span>
                        <DocSearchDialog open={searchOpen} onOpenChange={setSearchOpen}  />
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarGroup>
            { data ? <SidebarIndex data={data.docs} /> : <Loading />}
        </SidebarContent>
    </Sidebar>
}