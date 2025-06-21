import { createFileRoute } from '@tanstack/react-router'
import {rootRoute} from "@/routes/__root";
import {Alert} from "@/components/ui/alert";
import { CircleAlert } from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import DocLink from "@/routes/docs/-components/doc-link";
import {AspectRatio} from "@/components/ui/aspect-ratio";
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
    const { dashboard } = rootRoute.useRouteContext();

    return <div className='flex flex-col gap-4 items-center'>
        <h1 className='text-center text-4xl font-extrabold tracking-tight text-balance'>Добро пожаловать в Seadox</h1>
        <p>
            Seadox - это редактор документов, заточенный под структурированные данные
        </p>

        <h2 className='border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0'>Популярные документы</h2>
        {dashboard.success ?
            <div className='max-w-full grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {dashboard.value.map(doc => <DocLink key={doc.id} className='w-3xs' doc={doc}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{doc.name}</CardTitle>
                            <CardDescription>{doc.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {doc.coverUrl && <AspectRatio ratio={16/9}>
                                <img src={doc.coverUrl} alt={doc.name} className='h-full w-full rounded-lg object-fit' />
                            </AspectRatio>}
                        </CardContent>
                    </Card>
                </DocLink>)}
            </div>
        :
            <Alert variant='destructive'>
                <CircleAlert />
                Ошибка при запросе популярных документов
            </Alert>}
    </div>
}
