import {Database} from "@hocuspocus/extension-database";
import * as Y from "yjs";
import {
    getSeadocsById,
    getSeadocsByIdContent,
    patchSeadocsById,
    putSeadocsByIdContent
} from "seadox-shared/api/sdk.gen";
import {logger} from "./logger";

// noinspection JSUnusedGlobalSymbols
export const extension = new Database({
    fetch: async ({ documentName }) => {
        const { data: blob, response: getContentResponse } = await getSeadocsByIdContent({ path: { Id: documentName }, parseAs: 'blob' });

        switch (getContentResponse.status) {
            case 200:
                return await (blob as unknown as Blob).bytes();
            case 204:
                const { data, response: getDocResponse, error } = await getSeadocsById({ path: { Id: documentName } });

                if (!data) {
                    const status = getDocResponse.status;
                    logger.error({ documentName, status }, 'There was an error fetching seadoc')
                    throw error;
                }

                const { name } = data!;
                const newDoc = new Y.Doc();
                newDoc.getText('name').insert(0, name);
                newDoc.getText('type').insert(0, 'editor');

                return Y.encodeStateAsUpdate(newDoc);
            default:

                const status = getContentResponse.status;
                logger.error({ documentName, status }, 'Error returned from core api')
                throw new Error(`Cannot fetch contents of seadoc ${documentName}`);
        }
    },
    store: async ({ document, documentName, state }) => {
        try {
            const blob = new Blob([new Uint8Array(state)]);

            await putSeadocsByIdContent({
                path: { Id: documentName },
                body: { Content: blob },
                throwOnError: true
            });

            const { data: currentDoc } = await getSeadocsById({ path: { Id: documentName }, throwOnError: true });
            await patchSeadocsById({
                path: { Id: documentName },
                body: {
                    name: document.getText('name').toString(),
                    description: document.getText('description').toString(),
                    coverUrl: document.getText('coverUrl').toString(),
                    share: currentDoc.share
                },
                throwOnError: true
            });
        }
        catch (error) {
            logger.error({ documentName, error }, 'there was an error saving document')
        }
    }
});