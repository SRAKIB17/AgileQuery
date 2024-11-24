// Define the type for joins
import { JoinsType, SortType } from "./types";

/**
 * Interface for parameters used in the deleteSQL function.
 * @template Tables - A list of table names.
 */
export interface DeleteQueryParams<Tables extends string[]> {
    /**
     * The main table to delete rows from.
     */
    table: string;

    /**
     * The condition for deleting rows (WHERE clause).
     */
    where: string;

    /**
     * Sorting criteria for the DELETE query. Can be applied to the main table or related tables.
     */
    sort?: SortType<Tables>;

    /**
     * The maximum number of rows to delete.
     */
    limit?: string | number;

    /**
     * Joins to include in the query, supporting different JOIN types.
     */
    joins?: JoinsType<Tables>;
}

/**
 * Generates a DELETE SQL query based on the provided parameters.
 * 
 * @template Tables - A list of table names to use in the query.
 * @param {DeleteQueryParams<Tables>} params - Parameters for building the DELETE query.
 * @returns {string} - The generated DELETE SQL query.
 * 
 * @example
 * // Basic DELETE query
 * const query = deleteSQL({
 *   table: 'users',
 *   where: 'age > 30'
 * });
 * console.log(query);
 * // Output: DELETE users FROM users WHERE age > 30;
 * 
 * @example
 * // DELETE query with JOINs and sorting
 * const query = deleteSQL({
 *   table: 'orders',
 *   where: 'status = "pending"',
 *   joins: [
 *     { type: 'INNER JOIN', table: 'customers', on: 'orders.customer_id = customers.id' }
 *   ],
 *   sort: { orders: { order_date: -1 } },
 *   limit: 10
 * });
 * console.log(query);
 * // Output: DELETE orders FROM orders INNER JOIN customers ON orders.customer_id = customers.id WHERE status = "pending" ORDER BY order_date DESC LIMIT 10;
 */
export function deleteSQL<Tables extends string[]>({
    table,
    where,
    joins,
    limit,
    sort,
}: DeleteQueryParams<Tables>): string;
