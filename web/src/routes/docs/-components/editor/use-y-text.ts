import * as Y from "yjs";
import {useCallback, useEffect, useState} from "react";


export default function useYText(doc: Y.Doc | undefined, path: string, fallback?: string) {

    const text = doc?.getText(path);
    const [value, setValue] = useState(fallback ?? '');
    const updateValue = useCallback(() => setValue(text!.toString()), [text]);
    useEffect(() => {
        if (!text) {
            return;
        }
        setValue(text.toString());
        text.observe(updateValue);
        return () => text.unobserve(updateValue);
    }, [doc?.guid, path])

    const setText = useCallback((newText: string) => doc!.transact(() => {
        text!.delete(0, text!.toString().length);
        text!.insert(0, newText);
    }), [text]);

    return [value, setText] as const;
}