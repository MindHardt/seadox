import {Server} from "@hocuspocus/server";
import {extension as Database} from "./database";
import {Logger} from "@hocuspocus/extension-logger";
import {client} from "seadox-shared/apiclient/client.gen";

client.setConfig({
    auth: process.env.AUTHORIZATION_TOKEN
})
const server = new Server({
    port: 1234,
    extensions: [Database, new Logger()]
});

server.listen();