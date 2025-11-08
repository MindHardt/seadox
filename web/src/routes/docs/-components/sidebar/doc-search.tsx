import {useState} from "react";
import {getSeadocs, SeadocInfo} from "seadox-shared/api";
import {useDebouncedCallback} from "use-debounce";
import {Input} from "@/components/ui/input.tsx";
import {SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton} from "@/components/ui/sidebar.tsx";
import {Link} from "@tanstack/react-router";
import {Search} from "lucide-react";
import {client} from "@/routes/-backend/backend-client.ts";


export default function DocSearch() {

    const [results, setResults] = useState<SeadocInfo[]>();

    const startSearch = async (query: string) => {
        if (query.length === 0) {
            setResults(undefined);
            return;
        }

        const { data, error } = await getSeadocs({ client, query: { Query: query }});
        if (!data) {
            throw error;
        }

        setResults(data.data);
    }
    const scheduleSearch = useDebouncedCallback(startSearch, 200);

    return <>
        <SidebarGroup>
            <SidebarGroupLabel>Поиск</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuButton className='h-12'>
                    <Input className='group-data-[collapsible=icon]:hidden block' type='text' placeholder='...'
                           onChange={e => scheduleSearch(e.target.value)} />
                </SidebarMenuButton>
                {results?.map(x => <SidebarMenuButton key={x.id}>
                    <Search />
                    <Link to='/docs/$id' params={{ id: x.id! }}>
                        <span className='text-2xl'>{x.name}</span>
                    </Link>
                </SidebarMenuButton>)}
            </SidebarMenu>
        </SidebarGroup>
    </>
}