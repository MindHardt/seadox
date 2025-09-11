import {RefObject, useCallback, useEffect, useId, useRef} from "react";
import {TextAreaBinding} from "y-textarea";
import {HocuspocusProvider} from "@hocuspocus/provider";
import useProviderSync from "@/routes/docs/-components/editor/use-provider-sync.ts";
 
type BindingElement = HTMLInputElement | HTMLTextAreaElement;
export default function useTextareaBinding(
    ref: RefObject<BindingElement | null>,
    field: string,
    provider?: HocuspocusProvider) {

    const id = useId();
    const synced = useProviderSync(provider);
    const binding = useRef<TextAreaBinding>(null);
    const resizeInput = useCallback(
        () => binding.current?.rePositionCursors(), [binding.current]);

    useEffect(() => {
        window.addEventListener('resize', resizeInput);
        return () => {
            window.removeEventListener('resize', resizeInput);
        }
    }, []);
    useEffect(() => {
        if (!ref.current || !synced || !provider) {
            return;
        }

        ref.current.id = id;
        binding.current?.destroy();
        const text = provider.document.getText(field);
        binding.current = new TextAreaBinding(text, ref.current, {
            awareness: provider.awareness!
        });
    }, [provider])
}