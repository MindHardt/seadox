import {Server} from "@hocuspocus/server";
import {extension as Database} from "./database";
import {Logger} from "@hocuspocus/extension-logger";


const server = new Server({
    port: 1234,
    extensions: [Database, new Logger()]
});

server.listen();