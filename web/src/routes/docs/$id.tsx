import { createFileRoute } from '@tanstack/react-router'
import {getSeadocsById} from "seadox-shared/api";
import {Alert} from "@/components/ui/alert.tsx";
import {seo} from "@/lib/seo.ts";
import {SearchX} from "lucide-react";
import Seadoc from "@/routes/docs/-components/editor/seadoc.tsx";
import {HocuspocusProvider} from "@hocuspocus/provider";
import {useEffect, useState} from "react";
import Loading from "@/components/loading.tsx";
import DocLineage from "@/routes/docs/-components/editor/doc-lineage.tsx";

import './seadoc.css';

export const Route = createFileRoute('/docs/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const docRes = await getSeadocsById({ path: { Id: params.id } });
    if (!docRes.data) {
      return null;
    }

    return {
      doc: docRes.data
    }
  },
  head: async (ctx) => {
    const loader = ctx.loaderData;
    if (!loader) {
      return {};
    }

    const { doc } = loader;
    return {
      meta: [...seo({
        title: doc.name,
        description: doc.description,
        image: doc.coverUrl ?? undefined
      })]
    }
  }
})

function RouteComponent() {
  const data = Route.useLoaderData();
  const [provider, setProvider] = useState<HocuspocusProvider>();
  useEffect(() => {
    if (!data) {
      return;
    }

    setProvider(new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL,
      name: data.doc.id!
    }))
  }, [data]);

  if (!data) {
    return <div className='flex justify-center items-center size-full'>
      <Alert variant='destructive' className='w-100 flex flex-col items-center'>
        <SearchX />
        Документ не существует или у вас нет доступа к нему
      </Alert>
    </div>
  }

  return <div className='p-2 grid gap-2 grid-cols-1 md:grid-cols-4'>
    <DocLineage doc={data.doc} />
    <div className='col-span-2 p-2 md:border-x'>
      {provider ? <Seadoc doc={data.doc} provider={provider} /> : <Loading />}
    </div>
  </div>;
}
