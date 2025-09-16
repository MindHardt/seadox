import {SeadocModel} from "seadox-shared/api/types.gen";
import {AuthenticationResult} from "@/routes/-auth/get-current-user.ts";

export function canManage(user: AuthenticationResult['user'], doc: SeadocModel) : boolean {
    return user.roles.includes('Admin') || doc.ownerId === user.id;
}

export function canEdit(user: AuthenticationResult['user'] | undefined, doc: SeadocModel) : boolean {
    return doc.accessLevel === 'Write' || (!!user && canManage(user, doc));
}