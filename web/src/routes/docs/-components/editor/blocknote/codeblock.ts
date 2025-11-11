import {createHighlighter} from "shiki";
import {CodeBlockOptions} from "@blocknote/core";


export const codeBlock : CodeBlockOptions = {
    indentLineWithTab: true,
    defaultLanguage: 'json',
    supportedLanguages: {
        typescript: {
            name: "Typescript",
            aliases: ["ts"],
        },
        javascript: {
            name: "JavaScript",
            aliases: ["js"],
        },
        json: {
            name: "JSON",
        },
        xml: {
            name: "XML",
        },
        csharp: {
            name: 'C#',
            aliases: ["cs", "c#"]
        },
        shell: {
            name: 'Shell',
            aliases: ["bash", "sh", "shell", "zsh", "shellscript"]
        },
        diff: {
            name: "Diff",
            aliases: ["diff"]
        }
    },
    createHighlighter: () => createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['typescript', 'javascript', 'json', 'xml', 'csharp', 'shell', 'diff', 'text']
    })
}