import { createFileRoute } from '@tanstack/react-router'
import backendClient from "@/routes/-auth/backend-client.ts";
import {getSeadocsById} from "seadox-shared/api";
import {Alert} from "@/components/ui/alert.tsx";

export const Route = createFileRoute('/docs/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const client = backendClient();
    return (await getSeadocsById({ client, path: { Id: params.id } })).data ?? null;
  }
})

function RouteComponent() {
  const doc = Route.useLoaderData();

  if (doc){
    return <h1>{doc.name}</h1>;
  } else {
    return <Alert variant='destructive'>
      Ошибка
    </Alert>
  }
}
