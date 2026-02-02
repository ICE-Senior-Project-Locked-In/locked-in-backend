import { PaginationOptions, PaginationMetaData, OffsetPaginationOptions } from "../interfaces/pagination.interface";

export class PaginationHelper {
    static getOptions(query: { page?: number; itemsPerPage?: number }): PaginationOptions | undefined {
        if (query.page !== undefined && query.itemsPerPage !== undefined) {
            return {
                page: query.page,
                itemsPerPage: query.itemsPerPage,
            };
        }
        return undefined;
    }
    
    static getOffset(pagination?: PaginationOptions): OffsetPaginationOptions | undefined {
        if (!pagination) {
            return undefined;
        }

        return {
            skip: (pagination.page - 1) * pagination.itemsPerPage,
            take: pagination.itemsPerPage,
        };
    }

    static getMetaData(
        total: number,
        pagination?: PaginationOptions
    ): PaginationMetaData {
        const offset = pagination ? (pagination.page - 1) * pagination.itemsPerPage : 0;
        const limit = pagination?.itemsPerPage ?? total;

        return {
            offset,
            limit,
            total,
            hasNext: pagination ? offset + pagination.itemsPerPage < total : false,
            hasPrevious: pagination ? pagination.page > 1 : false,
        };
    }
}