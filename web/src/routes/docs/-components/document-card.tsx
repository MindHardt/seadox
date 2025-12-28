import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {SquarePen} from "lucide-react";
import {formatRelative} from "date-fns";
import {ru} from "date-fns/locale";
import useBrowser from "@/lib/use-browser.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {SeadocInfo} from "seadox-shared/api";


export default function DocumentCard({ doc } : {
    doc: SeadocInfo
}) {

    const isBrowser = useBrowser();
    return <Card className='h-full transition-[border-color] hover:border-gray-500'>
        <CardHeader>
            <CardTitle className='text-lg'>{doc.name}</CardTitle>
            <CardDescription>{doc.description}</CardDescription>
        </CardHeader>
        <CardContent className='flex-grow flex flex-col justify-end'>
            {doc.coverUrl &&
                <div className='w-full rounded overflow-hidden'>
                    <img src={doc.coverUrl} alt={doc.name} className='size-full aspect-square' />
                </div>}
        </CardContent>
        <CardFooter>
            <span className='text-gray-500 text-sm ms-auto flex flex-row items-center gap-1'>
                <SquarePen className='scale-75' />
                {isBrowser
                    ? <span className='text-sm'>
                        {formatRelative(Date.parse(doc.updatedAt), Date.now(), { locale: ru })}
                    </span>
                    : <Skeleton className='h-4 w-36' />}
            </span>
        </CardFooter>
    </Card>
}