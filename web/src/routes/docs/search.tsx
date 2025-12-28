import {createFileRoute, Link, useNavigate} from '@tanstack/react-router'
import {z} from "zod";
import {client} from "@/routes/-backend/backend-client.ts";
import {useDebouncedCallback} from "use-debounce";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Search, SearchX} from "lucide-react";
import {Pagination, PaginationContent, PaginationItem, PaginationLink} from "@/components/ui/pagination.tsx";
import {totalPages, page} from "@/routes/-backend/pagination.ts";
import {useEffect} from "react";
import { getSeadocs } from "seadox-shared/api";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import DocumentCard from "@/routes/docs/-components/document-card.tsx";

export const Route = createFileRoute('/docs/search')({
  component: RouteComponent,
  loaderDeps: ({ search: { q, p } }) => ({ q, p }),
  loader: async ({ deps: { q, p }}) => ({
    docs: await getSeadocs({
      client, query: { Prompt: q, ...page(p) }
    }).then(x => x.data ?? null),
    refDate: Date.now()
  }),
  validateSearch: z.object({
    q: z.string().optional().transform(x => (x && x.length > 0) ? x : undefined),
    p: z.number().min(1).default(1)
  })
})

function RouteComponent() {
  const { q, p } = Route.useSearch();
  const navigate = useNavigate({ from: '/docs/search' });
  const setQ = async (q: string) => {
    await navigate({ to: '.', search: prev => ({ ...prev, q }) })
  }

  const onSearchChange = useDebouncedCallback(setQ, 200);

  const { docs } = Route.useLoaderData();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [p]);

  const SearchBar = <InputGroup className='w-full'>
    <InputGroupInput
        defaultValue={q}
        onChange={e => onSearchChange(e.target.value)}
        placeholder='...'
    />
    <InputGroupAddon><Search /></InputGroupAddon>
    <InputGroupAddon align='inline-end'>
      {docs?.total ?? 0} Найдено
    </InputGroupAddon>
  </InputGroup>

  const Paginator = <Pagination>
    <PaginationContent>
      {p !== 1 && <>
        <PaginationItem>
          <PaginationLink
              to='/docs/search'
              search={prev => ({ ...prev, p: 1 })}>
            <ChevronFirst />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
              to='/docs/search'
              search={prev => ({ ...prev, p: p - 1 })}>
            <ChevronLeft />
          </PaginationLink>
        </PaginationItem>
      </>}
      <PaginationItem>
        <PaginationLink
            isActive={true}
            to='.'
            search={true}>
          {p}
        </PaginationLink>
      </PaginationItem>
      {p < totalPages(docs) && <>
        <PaginationItem>
          <PaginationLink
              to='/docs/search'
              search={prev => ({ ...prev, p: p + 1 })}>
            <ChevronRight />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
              to='/docs/search'
              search={prev => ({ ...prev, p: totalPages(docs) })}>
            <ChevronLast />
          </PaginationLink>
        </PaginationItem>
      </>}
    </PaginationContent>
  </Pagination>

  return <div className='flex justify-center'>
    <div className='mx-6 max-w-full flex flex-col gap-3'>
      {SearchBar}
      {Paginator}
      {docs && docs.total > 0 ? <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-5xl'>
            {docs.data.map(doc => <Link key={doc.id} to='/docs/$id' params={{ id: doc.id }}>
              <DocumentCard doc={doc} />
            </Link>)}
          </div> :
          <Alert className='w-48 my-4 mx-auto'>
            <SearchX />
            <AlertTitle>Ничего не найдено</AlertTitle>
          </Alert>}
      {Paginator}
    </div>
  </div>
}
