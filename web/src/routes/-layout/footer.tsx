import GithubIcon from "@/routes/-layout/github-icon.tsx";
import ThemeSelector from "@/routes/-layout/theme-selector.tsx";



export default function Footer() {

    return <footer className='p-2 flex justify-between'>
        <span className='text-gray-500 text-lg'>Seadox Document Network</span>
        <div className='flex flex-row gap-1'>
            <ThemeSelector />
            <a className='h-8' href='https://github.com/MindHardt/seadox'>
                <GithubIcon className='size-full m-auto' fill='var(--foreground)' />
            </a>
        </div>
    </footer>
}