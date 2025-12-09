import {createHighlighter} from "shiki";
import {CodeBlockOptions} from "@blocknote/core";

const languages = ['typescript', 'javascript', 'json', 'xml', 'csharp', 'shell', 'diff', 'text', 'yaml'] as const;
type LanguageName = typeof languages[number];
type LanguageInfo = { name: string, aliases?: string[] };
type Languages = Record<LanguageName, LanguageInfo>;

const compareLanguages = (left: [string, LanguageInfo], right: [string, LanguageInfo]) =>
    left[1].name.localeCompare(right[1].name);

export const codeBlock : CodeBlockOptions = {
    indentLineWithTab: true,
    defaultLanguage: 'json',
    supportedLanguages: Object.fromEntries([
        Object.entries({
            "csharp": {
                "name": "C#",
                "aliases": ["cs", "c#"]
            },
            "diff": {
                "name": "Diff",
                "aliases": ["diff"]
            },
            "javascript": {
                "name": "JavaScript",
                "aliases": ["js"]
            },
            "json": {
                "name": "JSON"
            },
            "text": {
                "name": "Plain",
                "aliases": ["plaintext", "text", "plain", "none"]
            },
            "shell": {
                "name": "Shell",
                "aliases": ["bash", "sh", "shell", "zsh", "shellscript"]
            },
            "typescript": {
                "name": "Typescript",
                "aliases": ["ts"]
            },
            "xml": {
                "name": "XML"
            },
            "yaml": {
                "name": "YAML",
                "aliases": ["yaml", "yml", "compose"]
            },
        } satisfies Languages).sort(compareLanguages)
    ]),
    createHighlighter: () => createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: [...languages]
    })
}
