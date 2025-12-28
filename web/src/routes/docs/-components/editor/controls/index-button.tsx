import {patchSeadocsById, SeadocModel} from "seadox-shared/api";
import {useQuery} from "@tanstack/react-query";
import {client} from "@/routes/-backend/backend-client.ts";
import {Button} from "@/components/ui/button.tsx";
import {SearchAlert, SearchX} from "lucide-react";
import {getSeadocsByIdOptions} from "seadox-shared/api/@tanstack/react-query.gen.ts";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import {isAdmin} from "@/routes/-backend/roles.ts";


export default function IndexButton({ doc } : {
    doc: SeadocModel
}) {

    const { data: admin } = useQuery({
        ...currentUserOptions(),
        select: data => isAdmin(data?.user)
    })
    const { refetch } = useQuery({
        ...getSeadocsByIdOptions({ client, path: { Id: doc.id }})
    });

    const onClick = async () => {
        await patchSeadocsById({
            client,
            path: { Id: doc.id },
            body: { isIndexed: !doc.isIndexed }
        })
        await refetch();
    }

    return <Tooltip>
        <TooltipTrigger asChild>
            <Button variant='outline' onClick={onClick} disabled={!admin}>
                {doc.isIndexed ? <SearchAlert className='text-orange-500' /> : <SearchX />}
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            {doc.isIndexed ? 'Включён в поиск' : 'Исключён из поиска'}
        </TooltipContent>
    </Tooltip>
}