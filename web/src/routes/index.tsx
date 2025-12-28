import {createFileRoute, Link} from '@tanstack/react-router'
import {Button} from "@/components/ui/button.tsx";
import {Home, Plus, Search} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import currentUserOptions from "@/routes/-auth/current-user-options.ts";
import CreateDocDialog from "@/routes/docs/-components/create-doc-dialog.tsx";
import {DialogTrigger} from "@/components/ui/dialog.tsx";
import SignInButton from "@/routes/-auth/sign-in-button.tsx";

export const Route = createFileRoute('/')({
  component: App,
})

function App() {

  const { data: authenticated } = useQuery({
    ...currentUserOptions(),
    select: data => Boolean(data)
  })

  return <div className='flex flex-col gap-2 items-center mx-auto'>
    <div className='w-lg max-w-full overflow-hidden'>
      <img src='/logo1024.png' alt='Seadox logo' className='size-full' />
    </div>
    <h1 className='text-5xl font-bold animate-pulse'>Seadox</h1>
    <p>Сеть rich-text документов с редактированием в реальном времени</p>
    <div className='flex flex-row gap-1'>
      <Link to='/docs/search'>
        <Button>
          <Search />
          Искать
        </Button>
      </Link>
      {authenticated
          ? <CreateDocDialog parentId={null}>
            <DialogTrigger>
              <Button>
                Создать документ
                <Plus />
              </Button>
            </DialogTrigger>
          </CreateDocDialog>
          : <SignInButton>
            Войти
            <Home />
          </SignInButton>}
    </div>
  </div>
}
