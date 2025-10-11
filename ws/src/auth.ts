import {Extension, onAuthenticatePayload} from "@hocuspocus/server";
import { createClient } from "seadox-shared/api/client/client.gen";
import {getSeadocsById} from "seadox-shared/api/sdk.gen";
import {logger} from "./logger";
import { AccessLevel } from "seadox-shared/api/types.gen";


// noinspection JSUnusedGlobalSymbols
export const extension = {
    onAuthenticate: async (data: onAuthenticatePayload) => {
        const { token, documentName } = data;

        const client = createClient({
            baseUrl: process.env.BACKEND_URL,
            headers: token ? {
                'Authorization': 'Bearer ' + token
            } : {}
        });

        const access : AccessLevel = await getSeadocsById({ client, path: { Id: documentName }})
            .then(({ data, response }) => {
                logger.info({ data, response, token }, 'received backend response');
                return data?.accessLevel ?? 'None';
            });
        switch (access) {
            case 'Write':
                logger.info({ documentName, token }, 'Allowing write access to doc');
                data.connectionConfig.readOnly = false;
                return;
            case 'Read':
                logger.info({ documentName, token }, 'Allowing read access to doc');
                data.connectionConfig.readOnly = true;
                return;
            case 'None':
                logger.info({ documentName, token }, 'Forbidding access to doc');
                data.connectionConfig.isAuthenticated = false;
                throw new Error('Access forbidden');
        }
    }
} satisfies Extension