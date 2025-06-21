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
import {SidebarProvider} from "@/components/ui/sidebar";
import DocsSidebar from "@/routes/-layout/docs-sidebar";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AuthModal from "@/routes/-layout/auth-modal";
import Links from "@/routes/-layout/links";
import {getCurrentUserFn} from "@/routes/-auth/actions";

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
        title: 'Seadox',
        description: 'Seadox is a realtime document network for data that matters',
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
        href: '/logo32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/logo16.png',
      },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async () => ({ user: await getCurrentUserFn() }),
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
  return <QueryClientProvider client={queryClient}>
    <html>
    <head>
      <HeadContent />
    </head>
    <body>
    <SidebarProvider>
      <DocsSidebar />
      <div className='bg-background relative z-10 flex flex-col min-h-svh w-full'>
        <header className='bg-background sticky top-0 z-50 w-full'>
          <div className='container-wrapper 3xl:fixed:px-0 px-6 py-2 w-full flex flex-row gap-2 justify-between'>
            <DocsSidebar.Trigger />
            <AuthModal />
          </div>
        </header>
        <main className='flex flex-1 flex-col max-w-5xl xl:min-w-xl xl:mx-auto'>
          {children}
          <TanStackRouterDevtools position="bottom-left" />
          <Scripts />
        </main>
        <footer className='flex flex-row justify-between px-6 py-2 items-center'>
          <span className='text-slate-500'>Seadox Document Network</span>
          <Links />
        </footer>
      </div>
    </SidebarProvider>
    </body>
    </html>
  </QueryClientProvider>
}

export const rootRoute = Route;
