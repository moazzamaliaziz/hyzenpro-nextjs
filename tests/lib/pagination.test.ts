import { describe, it, expect } from 'vitest';
import { parsePagination, paginatedResponse } from '@/lib/pagination';

describe('parsePagination', () => {
    it('returns defaults when no params', () => {
        const params = new URLSearchParams();
        const result = parsePagination(params);
        expect(result).toEqual({ page: 1, pageSize: 20, skip: 0 });
    });

    it('parses custom page and pageSize', () => {
        const params = new URLSearchParams({ page: '3', pageSize: '50' });
        const result = parsePagination(params);
        expect(result).toEqual({ page: 3, pageSize: 50, skip: 100 });
    });

    it('clamps pageSize to min 10', () => {
        const params = new URLSearchParams({ pageSize: '5' });
        const result = parsePagination(params);
        expect(result.pageSize).toBe(10);
    });

    it('clamps pageSize to max 100', () => {
        const params = new URLSearchParams({ pageSize: '200' });
        const result = parsePagination(params);
        expect(result.pageSize).toBe(100);
    });

    it('clamps page to min 1', () => {
        const params = new URLSearchParams({ page: '0' });
        const result = parsePagination(params);
        expect(result.page).toBe(1);
    });

    it('handles negative page', () => {
        const params = new URLSearchParams({ page: '-3' });
        const result = parsePagination(params);
        expect(result.page).toBe(1);
    });

    it('calculates skip correctly', () => {
        const params = new URLSearchParams({ page: '2', pageSize: '25' });
        const result = parsePagination(params);
        expect(result.skip).toBe(25);
    });
});

describe('paginatedResponse', () => {
    it('builds paginated response', () => {
        const data = [1, 2, 3];
        const pagination = { page: 1, pageSize: 10, skip: 0 };
        const result = paginatedResponse(data, 25, pagination);

        expect(result.data).toEqual(data);
        expect(result.pagination.total).toBe(25);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.pageSize).toBe(10);
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNext).toBe(true);
        expect(result.pagination.hasPrev).toBe(false);
    });

    it('hasPrev is true when page > 1', () => {
        const pagination = { page: 2, pageSize: 10, skip: 10 };
        const result = paginatedResponse([], 20, pagination);
        expect(result.pagination.hasPrev).toBe(true);
        expect(result.pagination.hasNext).toBe(false);
    });

    it('handles empty results', () => {
        const pagination = { page: 1, pageSize: 10, skip: 0 };
        const result = paginatedResponse([], 0, pagination);
        expect(result.data).toHaveLength(0);
        expect(result.pagination.totalPages).toBe(0);
        expect(result.pagination.hasNext).toBe(false);
    });
});