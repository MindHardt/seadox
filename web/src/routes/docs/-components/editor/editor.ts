import {Spoiler} from "@/routes/docs/-components/editor/spoiler";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

export const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        spoiler: Spoiler
    }
});