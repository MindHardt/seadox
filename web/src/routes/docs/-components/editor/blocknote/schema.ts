import {BlockNoteSchema, defaultStyleSpecs} from "@blocknote/core";
import {monospace} from "@/routes/docs/-components/editor/blocknote/monospace.tsx";


export const schema = BlockNoteSchema.create({
    styleSpecs: {
        ...defaultStyleSpecs,
        monospace
    }
})