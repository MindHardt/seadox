import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar.tsx";
import {useQuery} from "@tanstack/react-query";
import SidebarIndex from "@/routes/docs/-components/sidebar/sidebar-index.tsx";
import Loading from "@/components/loading.tsx";
import Logo from "@/routes/-layout/logo.tsx";
import DocSearch from "@/routes/docs/-components/sidebar/doc-search.tsx";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";


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
            <DocSearch />
            { docs ? <SidebarIndex data={docs} /> : <Loading />}
        </SidebarContent>
    </Sidebar>
}