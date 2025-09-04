import { createFileRoute } from '@tanstack/react-router'
import backendClient from "@/routes/-backend/backend-client.ts";
import {getSeadocsById} from "seadox-shared/api";
import {Alert} from "@/components/ui/alert.tsx";

export const Route = createFileRoute('/docs/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const client = backendClient();
    const docRes = await getSeadocsById({ client, path: { Id: params.id } });
    if (!docRes.data) {
      throw docRes.error;
    }

    return {
      doc: docRes.data
    }
  }
})

function RouteComponent() {
  const { doc } = Route.useLoaderData();

  if (doc){
    return <h1>{doc.name}</h1>;
  } else {
    return <Alert variant='destructive'>
      Ошибка
    </Alert>
  }
}
