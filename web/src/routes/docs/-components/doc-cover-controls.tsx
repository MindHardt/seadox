import {
    DropdownMenuItem,
    DropdownMenuPortal, DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { Trash, Upload } from "lucide-react";
import {Seadoc} from "@/routes/docs/-types";
import {uploadFileFn} from "@/routes/docs/-actions";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {useCallback, useEffect, useRef, useTransition } from "react";

export default function DocCoverControls({ doc, provider } : {
    doc: Seadoc,
    provider: HocuspocusProvider
}) {
    const field = provider.document.getText('cover');
    const input = useRef<HTMLInputElement>(null);

    const [pending, startTransition] = useTransition();
    const setCover = useCallback((file: File | null) => startTransition(async () => {
        if (!file) {
            field.delete(0, field.toString().length);
            return;
        }
        const uploadForm = new FormData();
        uploadForm.append('cover', file);
        const uploadResult = await uploadFileFn({ data: uploadForm });
        if (uploadResult.success)
        {
            provider.document.transact(() => {
                field.delete(0, field.toString().length);
                field.insert(0, uploadResult.value);
            })
        }
    }), [provider]);
    useEffect(() => {
        input.current = document.createElement('input');
        input.current.type = 'file';
        input.current.accept = 'image/*';
        input.current.onchange = (e) => {
            if (e.target && 'files' in e.target && e.target.files instanceof FileList && e.target.files.length > 0) {
                setCover(e.target.files.item(0)!)
            }
        }
    }, [doc.id]);

    return <DropdownMenuSub>
        <DropdownMenuSubTrigger>Обложка</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
            <DropdownMenuSubContent>
                <DropdownMenuItem disabled={pending} onClick={() => input.current?.click()}>
                    <Upload />
                    Загрузить
                </DropdownMenuItem>
                {doc.coverUrl && <DropdownMenuItem disabled={pending}
                    variant='destructive'
                    onClick={() => setCover(null)}>
                    <Trash />
                    Удалить
                </DropdownMenuItem>}
            </DropdownMenuSubContent>
        </DropdownMenuPortal>
    </DropdownMenuSub>
}