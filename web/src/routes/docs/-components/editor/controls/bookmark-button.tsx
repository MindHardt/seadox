import {useQuery} from "@tanstack/react-query";
import {SeadocModel} from "seadox-shared/api";
import {Button} from "@/components/ui/button.tsx";
import {Star} from "lucide-react";
import {deleteSeadocsByIdBookmark, postSeadocsByIdBookmark} from "seadox-shared/api";
import {client} from "@/routes/-backend/backend-client.ts";
import {getSeadocsIndexOptions} from "seadox-shared/api/@tanstack/react-query.gen";


export default function BookmarkButton({ doc } : {
    doc: SeadocModel
}) {

    const queryOpts = getSeadocsIndexOptions({ client });
    const { data: bookmarks, refetch } = useQuery({
        ...queryOpts,
        select: (data) => data?.bookmarks
    });

    const bookmarked = !!bookmarks?.map(x => x.id).includes(doc.id);
    const onClick = async () => {
        const options = { path: { Id: doc.id }, client };
        if (bookmarked) {
            await deleteSeadocsByIdBookmark(options);
        } else {
            await postSeadocsByIdBookmark(options);
        }
        await refetch();
    }

    return <Button variant='outline' onClick={onClick}>
        <Star fill={bookmarked ? 'oklch(85.2% 0.199 91.936)' : undefined} />
    </Button>
}