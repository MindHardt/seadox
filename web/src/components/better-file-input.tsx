import {ChangeEvent, ClipboardEvent, ComponentProps, useRef, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";


export default function BetterFileInput({ multiple, onUpload, ...props } : {
    onUpload?: (files: File[]) => void | Promise<void>;
} & Omit<ComponentProps<'input'>, 'type' | 'onChange'>) {

    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [imgSrc, setImgSrc] = useState<string>();

    const input = useRef<HTMLInputElement>(null);
    const dropzone = useRef<HTMLDivElement>(null);

    const buttonLabel = files.length == 0
        ? "Загрузить файл"
        : files.length == 1
            ? files[0].name
            : `Выбрано ${files.length} файлов`;
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiles([...e.target.files ?? []]);
        setImgSrc(e.target.files?.length === 1 && e.target.files[0].type.startsWith('image')
        ? URL.createObjectURL(e.target.files[0])
        : undefined);
    }
    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        input!.current!.files = e.clipboardData.files;
        input!.current!.dispatchEvent(new Event('change'));
        setFiles([]);
        imgSrc && URL.revokeObjectURL(imgSrc);
        setImgSrc(undefined);
    }

    return <>
        <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent onOpenAutoFocus={() => dropzone.current?.focus()}>
                <DialogHeader>
                    <DialogTitle>Загрузка файлов</DialogTitle>
                </DialogHeader>
                <div
                    ref={dropzone}
                    onPaste={handlePaste}
                    className='p-2 border rounded-sm border-b-gray-500 w-full min-h-50 flex flex-col justify-center items-center gap-1'>
                    {imgSrc && <img src={imgSrc} alt='image preview' className='rounded-sm'/>}
                    <Input type='file' onChange={handleChange} {...props} ref={input} />
                </div>
                <DialogFooter className='flex flex-row gap-1 w-full'>
                    <Button disabled={!input.current?.files?.length} className='grow' onClick={async () => {
                        onUpload && await onUpload(files);
                        setOpen(false);
                    }}>
                        Загрузить
                    </Button>
                    <Button variant='secondary' className='grow' onClick={() => {
                        setFiles([]);
                        setImgSrc(undefined);
                        setOpen(false);
                    }}>
                        Отмена
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}