import { createFileRoute } from '@tanstack/react-router'
import {getSeadocsById} from "seadox-shared/api";
import {Alert} from "@/components/ui/alert.tsx";
import {seo} from "@/lib/seo.ts";
import {SearchX} from "lucide-react";
import Seadoc from "@/routes/docs/-components/editor/seadoc.tsx";
import {HocuspocusProvider} from "@hocuspocus/provider";
import {useEffect, useState} from "react";
import DocLineage from "@/routes/docs/-components/editor/doc-lineage.tsx";

import {useQuery} from "@tanstack/react-query";
import {getSeadocsByIdQueryKey} from "seadox-shared/api/@tanstack/react-query.gen";
import DocControls from "@/routes/docs/-components/editor/controls/doc-controls.tsx";
import useSeadoxEditor from "@/routes/docs/-components/editor/blocknote/use-seadox-editor.ts";

import './-components/editor/seadoc.css';

export const Route = createFileRoute('/docs/$id')({
  component: RouteComponent,
  loader: async ({ params }) => getSeadocsById({ path: { Id: params.id } }).then(x => x.data ?? null),
  head: async (ctx) => {
    const doc = ctx.loaderData;
    if (!doc) {
      return {};
    }

    return {
      meta: [...seo({
        title: doc.name,
        description: doc.description,
        image: doc.coverUrl ?? undefined
      })]
    }
  }
})

const wsUrl = import.meta.env.VITE_WS_URL as string;
if (!wsUrl) {
  throw new Error('WS URL NOT SET');
}

function RouteComponent() {

  const { id } = Route.useParams();
  const queryOptions = { path: { Id: id }};
  const { data: doc } = useQuery({
    queryKey: getSeadocsByIdQueryKey(queryOptions),
    queryFn: () => getSeadocsById(queryOptions).then(x => x.data ?? null),
    initialData: Route.useLoaderData()
  });

  const [provider, setProvider] = useState<HocuspocusProvider>();
  useEffect(() => {
    if (!doc) {
      return;
    }

    const provider = new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL,
      name: doc.id!
    });
    setProvider(provider);
  }, [doc?.id]);
  const editor = useSeadoxEditor(provider);

  if (!doc) {
    return <div className='flex justify-center items-center size-full'>
      <Alert variant='destructive' className='w-100 flex flex-col items-center'>
        <SearchX />
        Документ не существует или у вас нет доступа к нему
      </Alert>
    </div>
  }

  return <div className='p-2 grid gap-2 grid-cols-1 md:grid-cols-4'>
    <DocLineage doc={doc} />
    <div className='col-span-2 p-2 md:border-x pb-64'>
      <Seadoc doc={doc} provider={provider} editor={editor} />
    </div>
    <DocControls doc={doc} editor={editor ?? null} />
  </div>;
}
