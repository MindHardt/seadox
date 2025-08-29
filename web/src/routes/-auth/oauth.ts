import * as crypto from "node:crypto";

export const oauth = {
    generateState: () => {
        return crypto.randomBytes(32).toString('base64url');
    },
    generateCodeVerifier: () => {

        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

        return { codeChallenge, codeVerifier };
    }
}