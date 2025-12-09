import {createHighlighter} from "shiki";
import {CodeBlockOptions} from "@blocknote/core";

export const codeBlock : CodeBlockOptions = {
    indentLineWithTab: true,
    defaultLanguage: 'json',
    supportedLanguages: {
        csharp: {
            name: "C#",
            aliases: ["cs", "c#"]
        },
        diff: {
            name: "Diff",
            aliases: ["diff"]
        },
        javascript: {
            name: "JavaScript",
            aliases: ["js"]
        },
        json: {
            name: "JSON"
        },
        text: {
            name: "Plain",
            aliases: ["plaintext", "text", "plain", "none"]
        },
        shell: {
            name: "Shell",
            aliases: ["bash", "sh", "shell", "zsh", "shellscript"]
        },
        typescript: {
            name: "Typescript",
            aliases: ["ts"]
        },
        xml: {
            name: "XML"
        },
        yaml: {
            name: "YAML",
            aliases: ["yaml", "yml", "compose"]
        }
    },
    createHighlighter: () => createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['typescript', 'javascript', 'json', 'xml', 'csharp', 'shell', 'diff', 'text', 'yaml']
    })
}
