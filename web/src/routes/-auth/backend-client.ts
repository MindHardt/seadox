import {createClient} from "seadox-shared/api/client";

export default function backendClient(accessToken?: string) {
    const baseUrl = import.meta.env.SSR
        ? process.env.BACKEND_URL
        : '/api';
    return createClient({
        baseUrl,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
}