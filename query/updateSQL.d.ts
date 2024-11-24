import { JoinsType, SortType } from "./types";

/**
 * Type definition for the parameters used in the `updateSQL` function.
 */
export interface UpdateSQLParams<Tables extends string[]> {
    table: string;
    updateData?: {
        [key: string]: string | number | null | {
            case: {
                when: string;
                then: any;
            }[];
            default: any;
        };
    };
    sort?: SortType<Tables>;
    where: string;
    nullValues?: string[];
    defaultValues?: string[];
    limit?: string | number;
    joins?: JoinsType<Tables>;
    fromSubQuery?: Record<string, string>;
    setCalculations?: {
        [key: string]: string;
    };
}

/**
 * Generates an UPDATE SQL query with flexible options for joins, conditional updates, and additional calculations.
 *
 * @param {UpdateSQLParams} params - Parameters for the SQL query.
 * @returns {string} - The generated SQL query.
 *
 * @throws {Error} - Throws an error if the `table` or `where` is missing.
 */
export function updateSQL<Tables extends string[]>(params: UpdateSQLParams<Tables>): string;
