export interface PaginationParams {
    page: number;
    pageSize: number;
    skip: number;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get('pageSize') ?? '20')));
    return { page, pageSize, skip: (page - 1) * pageSize };
}

export function paginatedResponse<T>(
    data: T[],
    total: number,
    { page, pageSize }: PaginationParams
) {
    return {
        data,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasNext: page * pageSize < total,
            hasPrev: page > 1,
        },
    };
}
