import {User} from "@/routes/-auth/get-current-user.ts";

export const roleNames = {
    admin: 'Admin'
} as const;

export const isInRole = (user: User | undefined, role: keyof typeof roleNames) =>
    user?.roles.includes(roleNames[role]) === true;

export const isAdmin = (user: User | undefined) =>
    isInRole(user, 'admin');