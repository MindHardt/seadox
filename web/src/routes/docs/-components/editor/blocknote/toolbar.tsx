import {
    BasicTextStyleButton,
    BlockTypeSelect,
    ColorStyleButton,
    CreateLinkButton,
    FileCaptionButton,
    FileReplaceButton,
    FormattingToolbar,
    FormattingToolbarController,
    NestBlockButton,
    TextAlignButton, UnnestBlockButton
} from "@blocknote/react";
import {MonospaceButton} from "@/routes/docs/-components/editor/blocknote/monospace.tsx";

export default function Toolbar() {
    return <FormattingToolbarController
        formattingToolbar={() => (
            <FormattingToolbar>
                <BlockTypeSelect key={"blockTypeSelect"} />
                <FileCaptionButton key={"fileCaptionButton"} />
                <FileReplaceButton key={"replaceFileButton"} />
                <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"}/>
                <BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"}/>
                <BasicTextStyleButton basicTextStyle={"underline"} key={"underlineStyleButton"}/>
                <BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"}/>
                <MonospaceButton key={"monospaceButton"} />
                <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"}/>
                <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"}/>
                <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"}/>
                <ColorStyleButton key={"colorStyleButton"} />
                <NestBlockButton key={"nestBlockButton"} />
                <UnnestBlockButton key={"unnestBlockButton"} />
                <CreateLinkButton key={"createLinkButton"} />
            </FormattingToolbar>
        )}
    />
}