import {getCookie} from "@tanstack/react-start/server";
import {createIsomorphicFn} from "@tanstack/react-start";
import {createContext, ReactNode, useContext, useState} from "react";

export type Theme = 'dark' | 'light' | undefined;

const COOKIE_NAME = 'theme';
export const getSavedTheme = createIsomorphicFn()
    .server(() => getCookie(COOKIE_NAME) as Theme)
    .client(() => document.cookie.split('; ').find(x => x.startsWith(COOKIE_NAME))?.split('=')[1] as Theme);

type ThemeContextProps = {
    theme: Theme,
    setTheme: (theme: Theme) => void,
}
const ThemeContext = createContext<ThemeContextProps>({
    theme: getSavedTheme(),
    setTheme: () => {},
});

export function ThemeProvider({ children } : {
    children: ReactNode
}) {
    const [theme, setTheme] = useState(getSavedTheme());
    const updateTheme = (theme: Theme) => {
        document.cookie = `${COOKIE_NAME}=${theme ?? ';MaxAge=0'}`;
        setTheme(theme);
    }

    return <ThemeContext value={{ theme, setTheme: updateTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
    return useContext(ThemeContext);
}

