import {useServerFn} from "@tanstack/react-start";
import z from "zod";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ArrowRight, CircleAlert, CircleCheckBig, UserRound, UserRoundCheck, UserRoundPlus} from "lucide-react";
import {Link, useRouter} from "@tanstack/react-router";
import {useForm} from "@tanstack/react-form";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormFieldErrors from "@/components/form-field-errors";
import {useFormStatus} from "react-dom";
import {signInFn, signInRequest} from "@/routes/-auth/actions";
import { useState } from "react";
import {Result} from "@/lib/result";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AspectRatio} from "@/components/ui/aspect-ratio";

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button disabled={pending} type="submit">
        Продолжить
        <ArrowRight />
    </Button>
}

export default function SignInDialog() {
    const router = useRouter();
    const signIn = useServerFn(signInFn);
    const [result, setResult] = useState<Result | undefined>()
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            action: 'login'
        } as z.infer<typeof signInRequest>,
        validators: {
            onChange: signInRequest
        },
        onSubmit: async ({ value }) => {
            const result = await signIn({ data: { ...value, returnUrl: window.location.href }});
            if (!result.success) {
                setResult({ success: false, error: result.error });
            } else {
                if (value.action === 'login') {
                    await router.invalidate();
                } else {
                    setResult({ success: true })
                }
            }
        }});

    return <div className='flex justify-between w-full'>
        <Link to='/' className='flex flex-row gap-1 items-center'>
            <div className='size-9'>
                <AspectRatio ratio={1}>
                    <img src='/logo64.png' alt='Seadox logo' className='size-full rounded-md object-cover' />
                </AspectRatio>
            </div>
            <h1 className='text-2xl group-data-[collapsible=icon]:hidden'>Seadox</h1>
        </Link>
        <Dialog>
            <DialogTrigger asChild>
                <Button><UserRound /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form className='flex flex-col gap-3' onSubmit={async e => {
                    e.preventDefault();
                    await form.handleSubmit();
                }}>
                    <DialogHeader>
                        <DialogTitle>Авторизация</DialogTitle>
                    </DialogHeader>
                    {result && <Alert variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? <CircleCheckBig /> : <CircleAlert />}
                        <AlertTitle>{result.success ? 'Успешно!' : 'Ошибка'}</AlertTitle>
                        <AlertDescription>
                            {result.success ? 'Перейдите по ссылке из письма на почте чтобы продолжить' : result.error}
                        </AlertDescription>
                    </Alert>}
                    <form.Field
                        name='action'
                        children={(field) =>
                            <div className='grid grid-cols-2 gap-1'>
                                <Button
                                    type='button'
                                    variant={field.state.value === 'login' ? 'default' : 'outline'}
                                    onClick={() => field.handleChange('login')}>
                                    <UserRoundCheck />
                                    Войти
                                </Button>
                                <Button
                                    type='button'
                                    variant={field.state.value === 'register' ? 'default' : 'outline'}
                                    onClick={() => field.handleChange('register')}>
                                    <UserRoundPlus />
                                    Создать
                                </Button>
                            </div>}
                    />
                    <form.Field
                        name='email'
                        children={(field) => <div className='flex flex-col gap-1'>
                            <FormFieldErrors field={field} />
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='user@seadox.ru'
                                value={field.state.value}
                                autoComplete='email'
                                onChange={e => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>}
                    />
                    <form.Field
                        name='password'
                        children={(field) => <div className='flex flex-col gap-1'>
                            <FormFieldErrors field={field} />
                            <Label htmlFor='password'>Пароль</Label>
                            <Input
                                id='password'
                                type='password'
                                value={field.state.value}
                                autoComplete={form.state.values.action === 'login' ? 'current-password' : 'new-password'}
                                onChange={e => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
}