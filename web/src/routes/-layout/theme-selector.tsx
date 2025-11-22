import {Popover, PopoverContent} from "@/components/ui/popover";
import {Theme, useTheme} from "@/routes/-layout/themes.tsx";
import {Moon, Palette, Sun} from "lucide-react";
import {PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import { useState } from "react";


const themes = [
    {
        name: "Системная",
        theme: undefined as Theme,
        icon: <Palette />
    },
    {
        name: "Светлая",
        theme: 'light' as Theme,
        icon: <Sun />
    },
    {
        name: "Тёмная",
        theme: 'dark' as Theme,
        icon: <Moon  />
    }
];

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);

    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant={ "secondary" } size='sm'>
                {themes.find(x => x.theme === theme)!.icon}
            </Button>
        </PopoverTrigger>
        <PopoverContent className='w-36' side='top'>
            <div className='flex flex-col gap-1'>
                <h3 className='text-lg text-center font-semibold'>Тема</h3>
                {themes.map(({ name, theme, icon }) =>
                    <Button
                        className='flex flex-row gap-1 items-center'
                        key={name}
                        variant='secondary'
                        onClick={() => { setTheme(theme); setOpen(false); }}>
                        {icon} {name}
                    </Button>)}
            </div>
        </PopoverContent>
    </Popover>
}