import {useState} from "react";
import {Dialog, DialogContent, DialogHeader} from "@/components/ui/dialog.tsx";
import {getSeadocs, SeadocInfo} from "seadox-shared/api";
import {useDebouncedCallback} from "use-debounce";
import {Input} from "@/components/ui/input.tsx";
import {useRouter} from "@tanstack/react-router";
import Loading from "@/components/loading.tsx";
import {DialogProps} from "@radix-ui/react-dialog";


export default function DocSearchDialog({ open, onOpenChange } : {
    open: DialogProps['open'],
    onOpenChange : DialogProps['onOpenChange'],
}) {

    const router = useRouter();
    const [results, setResults] = useState<SeadocInfo[] | null>([]);
    const search = useDebouncedCallback(async query => {
        setResults(null);
        const { data } = await getSeadocs({ query: { Query: query } });
        if (data) {
            setResults(data.data);
        }
    }, 1000);

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <Input onChange={e => search(e.target.value)} placeholder='Поиск...' />
            </DialogHeader>
            <div className='flex flex-col gap-1'>
                {results
                    ? results.map(x => <div key={x.id}
                        onClick={async () => {
                            onOpenChange && onOpenChange(false);
                            await router.navigate({ to: '/docs/$id', params: { id: x.id! }})
                        }}>
                        {x.name}
                    </div>)
                    : <Loading />}
            </div>
        </DialogContent>
    </Dialog>
}