import * as winston from "winston";
import {SeqTransport} from "@datalust/winston-seq";

if (typeof window !== 'undefined') {
    throw new Error('attempted to import server-side logger in browser');
}

export const createLogger = (application?: string, category?: string) => winston.createLogger({
    defaultMeta: {
        'Application': application ?? 'Seadox',
        'Category': category ?? 'not-specified',
    },
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.cli()
        }),
        new SeqTransport({
            serverUrl: process.env.SEQ_URL,
            onError: (e => { console.error(e) }),
        })
    ]
})