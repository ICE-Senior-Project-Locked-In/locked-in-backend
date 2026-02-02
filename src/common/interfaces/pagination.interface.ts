export interface PaginationOptions {
    page: number;
    itemsPerPage: number;
};

export interface OffsetPaginationOptions {
    skip: number;
    take: number;
}

export interface PaginationMetaData {
    offset: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetaData;
}