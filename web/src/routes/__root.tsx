import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'


import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import {getCurrentUser} from "@/routes/-auth/get-current-user.ts";
import Header from "@/routes/-layout/header.tsx";
import {ReactNode} from 'react'
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import DocsSidebar from "@/routes/docs/-components/sidebar/docs-sidebar.tsx";
import {seo} from "@/lib/seo.ts";
import { getSeadocsIndex } from 'seadox-shared/api/sdk.gen'
import {client} from "@/routes/-backend/backend-client.ts";
import Footer from "@/routes/-layout/footer.tsx";
import {ThemeProvider, useTheme} from "@/routes/-layout/themes.tsx";

import '../styles.css';

interface MyRouterContext {
  queryClient: QueryClient
}

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
  }),
  beforeLoad: async () => ({
    auth: await getCurrentUser(),
    docs: await getSeadocsIndex({ client }).then(x => x.data)
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

function App ({ children } : {
  children : ReactNode
}) {
  const { theme } = useTheme();

  // noinspection HtmlRequiredTitleElement
  return <html lang="en" className={theme}>
  <head>
    <HeadContent />
  </head>
  <body>
  <SidebarProvider>
    <div className='flex flex-row w-screen'>
      <DocsSidebar />
      <div className='flex flex-col grow w-full'>
        <Header />
        <main className='size-full my-2'>
          {children}
        </main>
        <Footer />
        {import.meta.env.DEV && <TanStackDevtools
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
      </div>
    </div>
  </SidebarProvider>
  <Scripts />
  </body>
  </html>

}

function RootDocument({ children }: { children: ReactNode }) {
  return <ThemeProvider>
    <App>{children}</App>
  </ThemeProvider>
}
