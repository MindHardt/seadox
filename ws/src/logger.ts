import * as bunyan from "bunyan";
import * as seq from "bunyan-seq";
import {Logger} from "@hocuspocus/extension-logger";

export const logger = bunyan.createLogger({
    name: 'seadox-ws',
    streams: [
        {
            stream: process.stdout,
            level: 'info'
        },
        seq.createStream({
            serverUrl: process.env.SEQ_URL,
            level: 'info'
        })
    ],
    src: true,
    'Application': 'Seadox-ws'
})

const messageRegex = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z]\s(?<message>.*)/;
export const extension = new Logger({
    log: (msg) => {
        if (typeof msg === "string") {
            const match = messageRegex.exec(msg);
            if (match && match.groups) {
                logger.info(match.groups['message']);
            }
        }
    }
})