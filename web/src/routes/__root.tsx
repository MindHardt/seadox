import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'


import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import {getCurrentUser} from "@/routes/-auth/get-current-user.ts";
import Header from "@/routes/-layout/header.tsx";
import { ReactNode } from 'react'
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import DocsSidebar from "@/routes/docs/-components/sidebar/docs-sidebar.tsx";
import {configureClient} from "@/routes/-backend/backend-client.ts";
import {client} from "seadox-shared/api/client.gen.ts";
import {seo} from "@/lib/seo.ts";

interface MyRouterContext {
  queryClient: QueryClient
}

configureClient(client);

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({})
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async () => ({
    auth: await getCurrentUser()
  }),
  shellComponent: RootDocument,
  errorComponent: (props) => <html>
  <body>
  <div style={{ color: 'red' }}>
    Произошла ошибка: {props.error.message}, сообщите разработчику
  </div>
  </body>
  </html>
})

function RootDocument({ children }: { children: ReactNode }) {

  // noinspection HtmlRequiredTitleElement
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
      <SidebarProvider>
        <div className='flex flex-row w-screen'>
          <DocsSidebar />
          <div className='flex flex-col grow'>
            <Header />
            <main className='size-full my-2'>
              {children}
            </main>
            {import.meta.env.DEV && <TanstackDevtools
                config={{
                  position: 'bottom-left',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
            />}
            <Scripts />
          </div>
        </div>
      </SidebarProvider>
      </body>
    </html>
  )
}
