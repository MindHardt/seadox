import {ReactNode, useState} from "react";
import {postSeadocs, SeadocInfo} from "seadox-shared/api";
import {useNavigate} from "@tanstack/react-router";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Check, LoaderCircle, X} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {client} from "@/routes/-backend/backend-client.ts";
import {getSeadocsIndexOptions} from "seadox-shared/api/@tanstack/react-query.gen";
import {useForm} from "@tanstack/react-form";
import {z} from "zod";
import {getSeadocsByIdOptions} from "seadox-shared/api/@tanstack/react-query.gen.ts";


export default function CreateDocDialog({ parentId, children } : {
    parentId: SeadocInfo['parentId'],
    children: ReactNode
}) {

    const [open, setOpen] = useState(false);
    const form = useForm({
        defaultValues: {
            name: ''
        },
        validators: {
            onBlur: z.object({
                name: z.string().min(3, { error: 'Введите минимум 3 символа' })
            })
        },
        onSubmit: async ({ value: { name } }) => {
            const { data: newDoc } = await postSeadocs({ client, body: { name, parentId }, throwOnError: true });
            await queryClient.fetchQuery({
                ...getSeadocsIndexOptions({ client })
            });
            await queryClient.fetchQuery({
                ...getSeadocsByIdOptions({ client, path: { Id: newDoc.id }})
            });

            console.log('created doc', newDoc);
            setOpen(false);
            form.reset();
            await navigate({ to: '/docs/$id', params: { id: newDoc.id }});
        }
    })
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    return <Dialog open={open} onOpenChange={setOpen}>
        {children}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Создать документ</DialogTitle>
            </DialogHeader>
            <form
                className='grid grid-cols-2 gap-2'
                onSubmit={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    // noinspection JSIgnoredPromiseFromCall
                    form.handleSubmit();
                }}>
                <form.Field
                    name='name'
                    children={(field) => <Input
                        className='col-span-2'
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        placeholder='Имя документа'
                        onChange={(e) => field.handleChange(e.target.value)} />}
                />
                <Button type='button' variant='outline' onClick={() => { form.reset(); setOpen(false); }}>
                    <X />
                    <span className='hidden md:inline'>Отмена</span>
                </Button>
                <form.Subscribe
                    selector={({ canSubmit, isSubmitting }) => ({ canSubmit, isSubmitting })}
                    children={({ canSubmit, isSubmitting }) =>
                        <Button type='submit' disabled={!canSubmit || isSubmitting }>
                            {isSubmitting ? <LoaderCircle className='animate-spin' /> : <Check />}
                            <span className='hidden md:inline'>Создать</span>
                        </Button>}
                    />
            </form>
        </DialogContent>
    </Dialog>
}