import {createServerFn} from "@tanstack/react-start";
import {getSupabaseServerClient} from "@/utils/supabase";
import useAuth from "@/hooks/use-auth";
import {useQuery} from "@tanstack/react-query";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar";
import {seadocSchema} from "@/routes/docs/-types/Seadoc";
import {DocLink} from "@/routes/docs/-components/doc-link";
import {ChevronRight} from "lucide-react";

const getDocsIndex = createServerFn().handler(async () => {
    const supabase = getSupabaseServerClient();
    const { data: root } = await supabase
        .from('seadocs')
        .select('name, id')
        .order('created_at', { ascending: false })
        .eq('parent_id', null);

    return {
        root: root!.map(x => seadocSchema.parse(x)),
        bookmarks: []
    }
})

export default function DocsSidebar() {
    const { user } = useAuth();
    const { data: index } = useQuery({
        queryKey: ['docs', 'index'],
        queryFn: getDocsIndex,
        enabled: !!user
    });

    if (!index) return <></>

    return  <Sidebar>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Документы</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {index.root.map(doc => <SidebarMenuItem key={doc.id}>
                            <SidebarMenuButton asChild>
                                <div className='flex flex-row gap-1'>
                                    <ChevronRight />
                                    <DocLink doc={doc} />
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>)}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
    </Sidebar>
}