export type Role = 'admin' | 'editor' | 'viewer';

export const ROLE_HIERARCHY: Record<Role, number> = {
    viewer: 1,
    editor: 2,
    admin: 3,
};
