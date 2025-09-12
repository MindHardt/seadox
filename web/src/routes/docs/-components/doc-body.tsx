import {HocuspocusProvider} from "@hocuspocus/provider";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {useCreateBlockNote} from "@blocknote/react";
import {BlockNoteView} from "@blocknote/shadcn";
import {rootRoute} from "@/routes/__root";
import {randomColor} from "@/routes/-auth/actions";
import { SeadocContext } from "./doc-view";
import {uploadFileFn} from "@/routes/docs/-actions";
import {Alert} from "@/components/ui/alert";
import { Bug } from "lucide-react";
import { CatchBoundary } from "@tanstack/react-router";
import { createHighlighter } from "shiki";

export default function DocBody({ doc, provider } : {
    doc: SeadocContext,
    provider : HocuspocusProvider
}) {

    const { user } = rootRoute.useRouteContext();
    // noinspection JSUnusedGlobalSymbols
    const editor = useCreateBlockNote({
        codeBlock: {
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
                    aliases: ["json"],
                },
                xml: {
                    name: "XML",
                    aliases: ["xml"],
                },
                yaml: {
                    name: "YAML",
                    aliases: ["yaml", "yml"]
                },
                markdown: {
                    name: "Markdown",
                    aliases: ["markdown", "md"]
                },
                csharp: {
                    name: "C#",
                    aliases: ["csharp", "cs", "c#"]
                },
                shell: {
                    name: "shell",
                    aliases: ["bash", "sh", "shell", "zsh"]
                },
            },
            createHighlighter: () => createHighlighter({
                themes: ['github-dark', 'github-light'],
                langs: ['typescript', 'javascript', 'json', 'xml', 'csharp', 'shell', 'yaml', 'markdown']
            })
        },
        collaboration: {
            fragment: provider.document.getXmlFragment('blocks'),
            provider,
            user: user.success ? {
                name: user.value.name,
                color: user.value.color
            } : {
                name: 'ANON',
                color: randomColor()
            }
        },
        uploadFile: async (file) => {
            const form = new FormData();
            form.append('file', file);

            const result = await uploadFileFn({ data: form });
            if (!result.success)
            {
                throw new Error(result.error);
            }

            return result.value;
        }
    }, [doc.id]);

    return <CatchBoundary
        getResetKey={() => 'doc-body-' + doc.id}
        errorComponent={e => <Alert className='flex flex-col items-center gap-2' variant='destructive'>
            <Bug />
            <p className='font-extrabold'>Произошла ошибка при загрузке документа.</p>
            <p className='font-mono'>{e.error.message}</p>
        </Alert>}
    >
        <BlockNoteView
            style={{ '--background': 'var(--color-background)', '--foreground': 'var(--color-foreground)' } as React.CSSProperties}
            editor={editor}
            editable={doc.editable}>
        </BlockNoteView>
    </CatchBoundary>
}