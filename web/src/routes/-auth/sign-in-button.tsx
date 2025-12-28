import {Button} from "@/components/ui/button.tsx";
import {Home} from "lucide-react";
import {useNavigate} from "@tanstack/react-router";
import {ReactNode} from "react";


export default function SignInButton({ children } : {
    children?: ReactNode;
}) {
    children ??= <>
        <Home />
        <span className='hidden md:inline'>Войти</span>
    </>

    const navigate = useNavigate();
    const onClick = () => navigate({
        to: '/api/auth/signin',
        search: { returnUrl: window.location.href },
        reloadDocument: true
    })

    return <Button onClick={onClick}>
        {children}
    </Button>
}