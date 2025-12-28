import {createFileRoute, Link, useNavigate} from '@tanstack/react-router'
import {z} from "zod";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import { getSeadocsOptions } from "seadox-shared/api/@tanstack/react-query.gen";
import {client} from "@/routes/-backend/backend-client.ts";
import {useDebouncedCallback} from "use-debounce";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Search} from "lucide-react";
import Loading from "@/components/loading.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {formatRelative} from "date-fns";
import {ru} from "date-fns/locale";
import {Pagination, PaginationContent, PaginationItem, PaginationLink} from "@/components/ui/pagination.tsx";
import {totalPages, page} from "@/routes/-backend/pagination.ts";

export const Route = createFileRoute('/docs/search')({
  component: RouteComponent,
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

  const onSearchChange = useDebouncedCallback(setQ, 500);

  const { data: docs, isFetching } = useQuery({
    ...getSeadocsOptions({
      client, query: { Query: q, ...page(p) }
    }),
    placeholderData: keepPreviousData
  });

  const SearchBar = <InputGroup className='w-full'>
    <InputGroupInput
        defaultValue={q}
        onChange={e => onSearchChange(e.target.value)}
        placeholder='...'
    />
    <InputGroupAddon><Search /></InputGroupAddon>
    <InputGroupAddon align='inline-end'>
      {isFetching ? <Loading /> : `${docs?.total ?? '-'} найдено`}
    </InputGroupAddon>
  </InputGroup>

  return <div className='mx-auto w-5xl max-w-full px-2 flex flex-col gap-3'>
    {SearchBar}
    {docs && <div className='grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {docs.data.map(doc => <Link key={doc.id} to='/docs/$id' params={{ id: doc.id }}>
        <Card className='h-full'>
          <CardHeader>
            <CardTitle>{doc.name}</CardTitle>
            <CardDescription>{doc.description}</CardDescription>
          </CardHeader>
          <CardContent className='flex-grow'>
            {doc.coverUrl &&
                <div className='w-full h-48 rounded overflow-hidden'>
                  <img src={doc.coverUrl} alt={doc.name} className='size-full' />
                </div>}
          </CardContent>
          <CardFooter>
            <span className='text-gray-500 ms-auto'>
              {formatRelative(Date.parse(doc.updatedAt), Date.now(), { locale: ru })}
            </span>
          </CardFooter>
        </Card>
      </Link>)}
    </div>}
    <Pagination>
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
              to='/docs/search'>
            {p}
          </PaginationLink>
        </PaginationItem>
        {p !== totalPages(docs) && <>
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
  </div>
}
