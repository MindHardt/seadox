import {ReactNode, useState, useTransition} from "react";
import {postSeadocs, SeadocInfo} from "seadox-shared/api";
import {useNavigate} from "@tanstack/react-router";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Check, X} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useQueryClient} from "@tanstack/react-query";
import CurrentUserOptions from "@/routes/-auth/current-user-options.ts";


export default function CreateDocDialog({ parentId, children } : {
    parentId: SeadocInfo['parentId'],
    children: ReactNode
}) {

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [pending, startTransition] = useTransition();

    const handleSubmit = () => startTransition(async () => {
        if (pending) {
            return;
        }

        const { data: newDoc } = await postSeadocs({ body: { name, parentId }, throwOnError: true });
        const { queryKey } = CurrentUserOptions;
        await queryClient.refetchQueries({ queryKey });

        console.log('created doc', newDoc);
        setOpen(false);
        setName('');
        await navigate({ to: '/docs/$id', params: { id: newDoc.id }});

    });

    return <Dialog open={open} onOpenChange={setOpen}>
        {children}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Создать документ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-2'>
                <Input
                    className='col-span-2'
                    value={name}
                    placeholder='Имя документа'
                    onChange={(e) => setName(e.target.value)} />
                <Button type='button' variant='outline' onClick={() => { setName(''); setOpen(false); }}>
                    <X />
                    <span className='hidden md:inline'>Отмена</span>
                </Button>
                <Button type='submit' disabled={pending || name.length === 0}>
                    <Check />
                    <span className='hidden md:inline'>Создать</span>
                </Button>
            </form>
        </DialogContent>
    </Dialog>
}