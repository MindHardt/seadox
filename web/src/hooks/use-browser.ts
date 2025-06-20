import {useEffect, useState} from "react";


export default function useBrowser() {
    const [isBrowser, setBrowser] = useState(false);
    useEffect(() => {
        setBrowser(true)
    }, []);
    return isBrowser;
}