import { describe, it, expect } from 'vitest';
import { ROLE_HIERARCHY } from '@/lib/roles';

describe('ROLE_HIERARCHY', () => {
    it('admin has the highest level', () => {
        expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor);
        expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.viewer);
    });

    it('editor is between admin and viewer', () => {
        expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer);
        expect(ROLE_HIERARCHY.editor).toBeLessThan(ROLE_HIERARCHY.admin);
    });
});
