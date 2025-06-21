import {createFileRoute} from '@tanstack/react-router'
import {getDocFn} from "@/routes/docs/-actions";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {CircleAlert, SearchX} from "lucide-react";
import {DocView} from "@/routes/docs/-components/doc-view";
import {useQuery} from "@tanstack/react-query";
import {seo} from "@/utils/seo";

export const Route = createFileRoute('/docs/$id')({
  component: RouteComponent,
  loader: async (context) => {
    const id = context.params.id;
    return await getDocFn({ data: { id }});
  },
  head: ctx => {
      if (!ctx.loaderData?.success) {
          return {}
      }

      const doc = ctx.loaderData.value;
      return {
          meta: [
              ...seo({
                  title: doc.name,
                  image: doc.coverUrl ?? undefined
              })
          ]
      }
  }
})

function RouteComponent() {
  const { id } = Route.useParams();
  const loader = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ['doc', id],
    queryFn: () => getDocFn({ data: { id }}),
    initialData: loader
  })

  if (!data.success) {
    return data.error === '404' ?
        <Alert variant='destructive'>
          <SearchX />
          <AlertTitle>Документ не найден</AlertTitle>
          <AlertDescription>
            Убедитесь что он существует и вам разрешено его просматривать
          </AlertDescription>
        </Alert>
        :
        <Alert variant='destructive'>
          <CircleAlert />
          <AlertTitle>Произошла ошибка</AlertTitle>
          <AlertDescription>
            {data.error}
          </AlertDescription>
        </Alert>
  }

  return <div className='w-full max-w-screen'>
    <DocView doc={data.value} />
  </div>
}
