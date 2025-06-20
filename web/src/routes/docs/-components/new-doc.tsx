import {ReactNode, useCallback, useId, useState, useTransition} from "react";
import {createServerFn} from "@tanstack/react-start";
import {useQueryClient} from "@tanstack/react-query";
import z from "zod";
import {getSupabaseServerClient} from "@/utils/supabase";
import {Seadoc} from "@/routes/docs/-types";
import {useRouter} from "@tanstack/react-router";
import DocsSidebar from "@/routes/-layout/docs-sidebar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {useForm} from "@tanstack/react-form";
import FormFieldErrors from "@/components/form-field-errors";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { createDocFn, createDocRequest } from "../-actions";

export default function NewDoc({ parentId, children } : {
    parentId: string | null,
    children: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const router = useRouter();

    const handleSubmit = useCallback(async ({ name }: { name: string }) =>
        startTransition(async () => {
            const result = await createDocFn({ data: { parentId, name }});
            if (!result.success) {
                throw new Error(result.error);
            }
            await queryClient.invalidateQueries({ queryKey: DocsSidebar.QueryKey });
            router.navigate({ to: '/docs/$id', params: { id: result.value.id } });
            setIsOpen(false);
        }), [parentId]);

    const form = useForm({
        defaultValues: {
            parentId,
            name: ""
        } satisfies z.infer<typeof createDocRequest>,
        validators: {
            onChange: createDocRequest
        },
        onSubmit: ({ value }) => handleSubmit(value)
    });
    const inputId = useId();

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent>
            <form className='flex flex-col gap-3' onSubmit={async e => {
                e.preventDefault();
                await form.handleSubmit();
            }}>
                <DialogHeader>
                    <DialogTitle>Создать документ</DialogTitle>
                </DialogHeader>
                <form.Field
                    name='name'
                    children={(field) => <div className='flex flex-col gap-1'>
                        <FormFieldErrors field={field} />
                        <Label htmlFor={inputId}>Имя документа</Label>
                        <Input
                            id={inputId}
                            type='text'
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
                    <Button disabled={isPending} type="submit">Создать</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

}