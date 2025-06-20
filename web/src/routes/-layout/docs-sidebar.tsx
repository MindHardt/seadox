import {createServerFn} from "@tanstack/react-start";
import {getSupabaseServerClient} from "@/utils/supabase";
import useAuth from "@/hooks/use-auth";
import {useQuery} from "@tanstack/react-query";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger
} from "@/components/ui/sidebar";
import {seadocSchema} from "@/routes/docs/-types";
import DocLink from "@/routes/docs/-components/doc-link";
import {ChevronRight, FilePlus2} from "lucide-react";
import {rootRoute} from "@/routes/__root";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import * as React from "react";
import {Button} from "@/components/ui/button";
import NewDoc from "@/routes/docs/-components/new-doc";

const getDocsIndex = createServerFn().handler(async () => {
    const supabase = getSupabaseServerClient();
    const { data: root } = await supabase
        .from('seadocs')
        .select()
        .order('created_at', { ascending: false })
        .is('parent_id', null);
    if (!root) {
        return null;
    }

    return {
        root: root.map(x => seadocSchema.parse({
            id: x.id,
            name: x.name,
            public: x.public,
            ownerId: x.owner_id,
        })),
        bookmarks: []
    }
})

const queryKey = ['docs', 'index'];
function DocsSidebar() {
    const { user } = useAuth();
    const { data: index } = useQuery({
        queryKey: queryKey,
        queryFn: getDocsIndex,
        enabled: !!user?.authenticated
    });

    if (!index) return <></>

    return <Sidebar collapsible='icon'>
        <SidebarContent>
            <SidebarHeader>
                <div className='flex flex-row gap-1 items-center'>
                    <div className='size-9'>
                        <AspectRatio ratio={1}>
                            <img src='/logo64.png' alt='Seadox' className='size-full rounded-md object-cover' />
                        </AspectRatio>
                    </div>
                    <h1 className='text-2xl group-data-[collapsible=icon]:hidden'>Seadox</h1>
                </div>
            </SidebarHeader>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <NewDoc parentId={null}>
                                    <Button className='group-data-[collapsible=icon]:max-w-full'>
                                        <FilePlus2 />
                                        <span className='group-data-[collapsible=icon]:hidden'>Создать</span>
                                    </Button>
                                </NewDoc>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel>Документы</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {index.root.map(doc =>
                            <SidebarMenuItem key={doc.id}>
                                <SidebarMenuButton asChild>
                                    <DocLink doc={doc} className='flex flex-row gap-2'>
                                        <ChevronRight />
                                        <span className='text-xl text-slate-500 group-data-[collapsible=icon]:overflow-hidden'>
                                            {doc.name}
                                        </span>
                                    </DocLink>
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
DocsSidebar.Trigger = () => {
    const { user } = rootRoute.useRouteContext();
    return user.authenticated && <SidebarTrigger className='size-9' size={'icon'} />
}
DocsSidebar.QueryKey = queryKey;

export default DocsSidebar;
