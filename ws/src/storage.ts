import {Database} from "@hocuspocus/extension-database";
import supabase from "./supabase";


export const extension = new Database({
    fetch: async ({ documentName }) => {
        const { data: body } = await supabase()
            .storage
            .from('seadocs.contents')
            .download(documentName);

        return await body?.bytes();
    },
    store: async (payload) => {
        await supabase().storage
            .from('seadocs.contents')
            .update(payload.documentName, payload.state);
    }
});