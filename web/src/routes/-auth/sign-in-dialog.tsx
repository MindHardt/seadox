import {createServerFn, useServerFn} from "@tanstack/react-start";
import {getSupabaseServerClient} from "@/utils/supabase";
import z from "zod";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {AlertCircleIcon, UserRound, UserRoundCheck, UserRoundPlus} from "lucide-react";
import {redirect, useRouter} from "@tanstack/react-router";
import {createFormHook, createFormHookContexts, useForm} from "@tanstack/react-form";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import FormFieldErrors from "@/components/form-field-errors";
import {useFormState, useFormStatus} from "react-dom";
import {signInFn, signInRequestSchema} from "@/routes/-auth/actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button disabled={pending} type="submit">Войти</Button>
}

export default function SignInDialog() {
    const router = useRouter();
    const signIn = useServerFn(signInFn);
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            action: 'login'
        } as z.infer<typeof signInRequestSchema>,
        validators: {
            onChange: signInRequestSchema
        },
        onSubmit: async ({ value }) => {
            const { error } = await signIn({ data: { ...value, returnUrl: window.location.href }});
            if (!error) {
                await router.invalidate();
            }
        }});

    return <Dialog>
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
                <form.Field
                    name='action'
                    children={(field) =>
                        <div className='flex flex-row gap-1'>
                            <Button
                                variant={field.state.value === 'login' ? 'default' : 'outline'}
                                onClick={() => field.handleChange('login')}>
                                <UserRoundCheck />
                                Войти
                            </Button>
                            <Button
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
}