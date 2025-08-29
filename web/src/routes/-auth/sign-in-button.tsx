import {Button} from "@/components/ui/button.tsx";
import {Home} from "lucide-react";
import {useRouter} from "@tanstack/react-router";


export default function SignInButton() {
    const router = useRouter();

    return <Button onClick={() => router.navigate({ href: `/api/auth/signin?returnUrl=${window.location.href}`, reloadDocument: true })}>
        <Home />
        <span className='hidden md:inline'>Войти</span>
    </Button>
}