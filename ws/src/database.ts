import {Database} from "@hocuspocus/extension-database";
import * as Y from "yjs";
import {
    getSeadocsById,
    getSeadocsByIdContent,
    patchSeadocsById,
    putSeadocsByIdContent
} from "seadox-shared/apiclient/sdk.gen";

// noinspection JSUnusedGlobalSymbols
export const extension = new Database({
    fetch: async ({ documentName }) => {
        const { response, error } = await getSeadocsByIdContent({ path: { Id: documentName } });
        if (error) {
            throw error;
        }

        switch (response.status) {
            case 200:
                return await response.bytes();
            case 204:
                const { data, error } = await getSeadocsById({ path: { Id: documentName } });

                if (error) {
                    throw error;
                }

                const { name } = data!;
                const newDoc = new Y.Doc();
                newDoc.getText('name').insert(0, name);
                newDoc.getText('type').insert(0, 'editor');

                return Y.encodeStateAsUpdate(newDoc);
            default:
                throw new Error(`Cannot fetch contents of seadoc ${documentName}`);
        }
    },
    store: async ({ document, documentName, state }) => {
        const blob = new Blob([state]);

        await putSeadocsByIdContent({ path: { Id: documentName }, body: { Content: blob } });
        await patchSeadocsById({
            path: { Id: documentName },
            body: {
                name: document.getText('name').toString(),
                description: document.getText('description').toString(),
                coverUrl: document.getText('cover').toString()
            }
        });
    }
});