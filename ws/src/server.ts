import {Server} from "@hocuspocus/server";
import {extension as Database} from "./database";
import {extension as Logger} from "./logger";
import {extension as Auth} from "./auth";
import {client} from "seadox-shared/api/client.gen";

client.setConfig({
    baseUrl: process.env.BACKEND_URL,
    headers: {
        'Authorization': `Bearer ${process.env.AUTHORIZATION_TOKEN}`,
    }
})
const server = new Server({
    port: 1234,
    extensions: [Auth, Database, Logger],
});

server.listen();