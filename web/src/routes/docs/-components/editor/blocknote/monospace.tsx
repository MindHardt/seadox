import {createReactStyleSpec, useBlockNoteEditor, useComponentsContext} from "@blocknote/react";
import {schema} from "@/routes/docs/-components/editor/blocknote/schema.ts";
import {Type} from "lucide-react";

export const monospace = createReactStyleSpec({
    type: 'monospace',
    propSchema: "boolean"
}, {
    render: (props) => <span
        ref={props.contentRef}
        className='font-mono'>
    </span>
});
export function MonospaceButton() {
    const editor = useBlockNoteEditor<
        typeof schema.blockSchema,
        typeof schema.inlineContentSchema,
        typeof schema.styleSchema>();
    const Components = useComponentsContext()!;

    return editor.isEditable && <Components.FormattingToolbar.Button
        label="Monospace"
        mainTooltip={"Monospace"}
        icon={<Type height='1em' width='1em' />}
        variant='default'
        isSelected={editor.getActiveStyles().monospace}
        onClick={() => {
            editor.toggleStyles({
                monospace: true
            });
        }}
    />
}