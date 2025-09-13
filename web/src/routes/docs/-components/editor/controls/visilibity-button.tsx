import {DocumentShareMode, getSeadocsById, SeadocModel, patchSeadocsById} from "seadox-shared/api";
import { getSeadocsByIdOptions } from "seadox-shared/api/@tanstack/react-query.gen";
import {useQuery} from "@tanstack/react-query";
import {Button} from "@/components/ui/button.tsx";
import {Ban, Eye, ListEnd, ListMinus, Pencil} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {JSX} from "react";


export default function VisibilityButton({ doc } : {
    doc: SeadocModel
}) {
    const { data: docData, refetch } = useQuery(getSeadocsByIdOptions({ path: { Id: doc.id }}));

    const disabled = !docData || docData.accessLevel !== 'Write';
    const button = <Button disabled={disabled}><Eye /></Button>
    if (disabled) {
        return button;
    }

    const changeShare = async (share: Partial<DocumentShareMode>) => {
        const { data: doc } = await getSeadocsById({ path: { Id: docData.id }, throwOnError: true });
        await patchSeadocsById({
            path: {  Id: doc.id },
            body: {
                ...doc,
                share: {
                    ...doc.share,
                    ...share
                }
            }
        });
        await refetch();
    };
    const shareAccesses : [DocumentShareMode['access'], string, JSX.Element][] = [
        ['None', 'Нет доступа', <Ban />],
        ['Read', 'Чтение', <Eye />],
        ['Write', 'Изменение', <Pencil />]
    ]
    const shareTypes : [DocumentShareMode['type'], string, JSX.Element][] = [
        ['CurrentOnly', 'Только этот', <ListMinus />],
        ['Cascades', 'Дочерние', <ListEnd />]
    ]

    return <Popover>
        <PopoverTrigger asChild>
            {button}
        </PopoverTrigger>
        <PopoverContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-center'>Доступ</h3>
                    {shareAccesses.map(([access, name, icon]) =>
                    <Button
                        onClick={() => changeShare({ access })}
                        variant={docData.share.access === access ? 'default' : 'outline'}>
                        {icon} {name}
                    </Button>)}
                </div>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-center'>Применяется</h3>
                    {shareTypes.map(([type, name, icon]) =>
                        <Button
                            onClick={() => changeShare({ type })}
                            variant={docData.share.type === type ? 'default' : 'outline'}>
                            {icon} {name}
                        </Button>)}
                </div>
            </div>
        </PopoverContent>
    </Popover>
}