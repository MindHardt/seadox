import {createClient} from "seadox-shared/api/client";
import {getCookie} from "@tanstack/react-start/server";


export const backendClient = (accessToken?: string) => createClient({
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
});

export const serverClient = () => backendClient(getCookie('access_token'));