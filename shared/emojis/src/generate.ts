import * as fs from 'node:fs/promises'
import {z} from "zod";

// https://www.unicode.org/Public/emoji/16.0/emoji-test.txt
const emojiFile = await fs.readFile('./emojis/src/emoji-test.txt', { encoding: 'utf-8' });

const emojiRegex = /^(?<code>[0-9A-F\s]+?)\s+;\s(?<status>[a-z-]+)\s+#\s(?<unicode>.*?)\sE[0-9.]+\s(?<name>.+)$/;
type Emoji = {
    code: string,
    unicode: string,
    name: string,
    assets?: {
        svg: string | null,
        png: string | null
    },
    keywords?: string
}

let emojis : Emoji[] = emojiFile
    .split('\n')
    .filter(x => x.length !== 0 && !x.startsWith('#'))
    .map(x => {
        const match = x.match(emojiRegex);
        if (!match || !match.groups) {
            throw new Error(`Bad emoji line ${x}`);
        }

        return {
            code: match.groups['code'],
            unicode: match.groups['unicode'],
            name: match.groups['name']
        } satisfies Emoji
    });

// https://github.com/discord/twemoji/tree/main/assets
const assetsDir = './emojis/src/assets';
for (const emoji of emojis) {
    let code = emoji.code
        .toLowerCase()
        .replaceAll(' ', '-');
    let svg = await fs.readFile(`${assetsDir}/svg/${code}.svg`, { encoding: 'utf-8' }).catch(() => null);
    let png = await fs.readFile(`${assetsDir}/72x72/${code}.png`, { encoding: 'base64' }).catch(() => null);
    if (code.endsWith('-fe0f') && !(svg || png)) {
        code = code.replace(/-fe0f$/, '');
        svg = await fs.readFile(`${assetsDir}/svg/${code}.svg`, { encoding: 'utf-8' }).catch(() => null);
        png = await fs.readFile(`${assetsDir}/72x72/${code}.png`, { encoding: 'base64' }).catch(() => null);
    }

    if (svg || png) {
        emoji.assets = { svg, png }
    }
}

const noAssetEmojis = emojis.filter(x => !x.assets)
for (const emoji of noAssetEmojis) {
    console.warn(`Emoji ${emoji.unicode} (${emoji.code}) lacks asset`);
}
console.error(`${noAssetEmojis.length} emojis lack assets`);

emojis = emojis.filter(x => x.assets);
const ruKeywords = await parseKeywords('./emojis/src/meta/ru.json');
const enKeywords = await parseKeywords('./emojis/src/meta/en.json');

for (const emoji of emojis) {
    emoji.keywords = emoji.name;
    const ruTags = ruKeywords[emoji.unicode];
    const enTags = enKeywords[emoji.name];
    if (ruTags) {
        emoji.keywords += ' ' + ruTags?.tags.join(' ');
    }
    if (enTags) {
        emoji.keywords += ' ' + enTags?.tags.join(' ');
    }
}

console.log('Done');

async function parseKeywords(path: string) {
    const json = await fs.readFile(path, { encoding: 'utf-8' });
    const emojis = [...JSON.parse(json)]
        .flatMap(x => x['emojiList'])
        .map(x => z.object({
            unicode: z.string(),
            tags: z.array(z.string())
        }).parse(x));
    return Object.fromEntries(emojis.map(x => [x.unicode, x]));
}


