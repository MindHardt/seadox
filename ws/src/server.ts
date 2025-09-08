import {Server} from "@hocuspocus/server";
import {extension as Database} from "./database";
import {extension as Logger} from "./logger";
import {client} from "seadox-shared/api/client.gen";

client.setConfig({
    headers: {
        'Authorization': `Bearer ${process.env.AUTHORIZATION_TOKEN}`,
    }
})
const server = new Server({
    port: 1234,
    extensions: [Database, Logger]
});

server.listen();