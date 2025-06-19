/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'
import appCss from '../styles/app.css?url'
import { seo } from '@/utils/seo'
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import DocsSidebar from "@/routes/-layout/docs-sidebar";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

const queryClient = new QueryClient();
function RootDocument({ children }: { children: React.ReactNode }) {

  // noinspection HtmlRequiredTitleElement
  return (
      <QueryClientProvider client={queryClient}>
        <html>
        <head>
          <HeadContent />
        </head>
        <body>
        <SidebarProvider>
          <div className='bg-background relative z-10 flex min-h-svh'>
            <DocsSidebar />
            <header className='bg-background sticky top-0 z-50 w-full'>
              <div className='container-wrapper 3xl:fixed:px-0 px-6'>
                <SidebarTrigger />
              </div>
            </header>
            <main className='flex flex-1 flex-col'>
              {children}
              <TanStackRouterDevtools position="bottom-right" />
              <Scripts />
            </main>
            <footer>

            </footer>
          </div>
        </SidebarProvider>
        </body>
        </html>
      </QueryClientProvider>
  )
}
