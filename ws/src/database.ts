import {Database} from "@hocuspocus/extension-database";
import supabase from "./supabase";
import * as Y from "yjs";

// noinspection JSUnusedGlobalSymbols
export const extension = new Database({
    fetch: async ({ documentName }) => {
        const { data: body } = await supabase()
            .storage
            .from('seadocs.contents')
            .download(documentName);

        if (!body) {
            const { data: rows, error } = await supabase()
                .from('seadocs')
                .select('name')
                .eq('id', documentName);
            if (error) {
                throw error;
            }

            const { name } = rows.pop()!;
            const newDoc = new Y.Doc();
            newDoc.getText('name').insert(0, name);
            newDoc.getText('type').insert(0, 'editor');

            return Y.encodeStateAsUpdate(newDoc);
        }

        return await body.bytes();
    },
    store: async ({ document, documentName, state }) => {

        const { error: dbError } = await supabase()
            .from('seadocs')
            .update({
                name: document.getText('name').toString(),
                description: document.getText('description').toString(),
                cover_url: document.getText('cover').toString() || null
            })
            .eq('id', documentName);
        if (dbError) {
            console.error('ERROR STORING DOCUMENT TO DATABASE', documentName, dbError);
        }

        const { error: storageError } = await supabase().storage
            .from('seadocs.contents')
            .update(documentName, state);
        if (storageError) {
            console.error('ERROR STORING DOCUMENT TO STORAGE', documentName, storageError);
        }
    }
});