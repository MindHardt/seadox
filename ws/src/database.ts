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
        const name = document.getText('name').toString();
        const description = document.getText('description').toString();

        console.error('STORE', name, description);
        const images = document.getXmlFragment('editor').createTreeWalker(e =>
            e instanceof Y.XmlElement && e.nodeName === 'image');
        const coverUrl = [...images].pop()?._map.get('url')?.content.getContent()[0] as string ?? null;

        await supabase()
            .from('seadocs')
            .update({ name, description, cover_url: coverUrl })
            .eq('id', documentName);

        await supabase().storage
            .from('seadocs.contents')
            .update(documentName, state);
    }
});