import {createClient} from "seadox-shared/api/client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const backendClient = (accessToken?: string) => createClient({
    baseUrl: backendUrl,
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
});