import { JoinsType, SortType } from "./types";

export type AggregateFunctions = 'MIN' | 'MAX' | 'SUM' | 'COUNT' | 'AVG';


export interface SelectQueryParams<Tables extends string[]> {
    distinct?: boolean;
    table?: string;
    sort?: SortType<Tables>;

    limitSkip?: { limit?: number; skip?: number };
    columns?: {
        [P in Tables[number]]?: string[]
    } | {
        extra?: string | string[]
    } | string | string[];
    groupBy?: {
        [P in Tables[number]]?: string[]
    } | {
        extra?: string | string[]
    } | string | string[];

    aggregates?: Array<{
        [K in keyof Record<AggregateFunctions, string>]?: string;
    } | { alias?: string; }>
    where?: string,
    having?: string,
    subQueries?: {
        query: string,
        as?: string,
    }[],
    joins?: JoinsType<Tables>,
    recursiveCTE?: { baseCase: string, recursiveCase: string, alias: string },
}


/**
 * Builds a MySQL SELECT query based on the provided configuration, supporting various SQL features like 
 * joins, aggregates, subqueries, sorting, grouping, and more.
 *
 * @param {SelectQueryParams<Tables>} config - The configuration object for building the query.
 * @param {boolean} [config.distinct] - Whether to apply `DISTINCT` to the query results.
 * @param {string} [config.table] - The table to select data from.
 * @param {Record<string, 1 | -1>} [config.sort] - Sorting order for the query. Use 1 for ascending, -1 for descending.
 * @param {SelectQueryParams['limitSkip']} [config.limitSkip] - Limit and offset for pagination.
 * @param {SelectQueryParams['columns']} [config.columns] - Specific columns to select, or `*` for all.
 * @param {SelectQueryParams['groupBy']} [config.groupBy] - Columns to group the results by.
 * @param {SelectQueryParams['aggregates']} [config.aggregates] - Aggregates like `COUNT`, `SUM`, `AVG`, etc.
 * @param {string} [config.where] - The `WHERE` clause condition for the query.
 * @param {string} [config.having] - The `HAVING` clause for filtered aggregates.
 * @param {SelectQueryParams['subQueries']} [config.subQueries] - Subqueries to include in the select columns.
 * @param {SelectQueryParams['joins']} [config.joins] - `JOIN` clauses to link other tables.
 * @param {SelectQueryParams['recursiveCTE']} [config.recursiveCTE] - Recursive `CTE` for hierarchical data.
 * @returns {string} - The generated SQL SELECT query as a string.
 * 
 * @example
 * const query = buildMySQLQuery({
 *   table: 'orders', // Main table
 *   columns: { orders: ['order_id', 'status', 'customer_id'] }, // Specific columns
 *   where: 'status = "shipped"', // WHERE condition
 *   sort: { orders: { order_date: -1 } }, // Sorting by order_date in descending order
 *   limitSkip: { limit: 10, skip: 0 }, // Pagination (limit 10, offset 0)
 *   aggregates: [
 *     { COUNT: 'order_id' }, // Count the number of orders
 *     { SUM: 'total_amount' }, // Sum of total_amount
 *     { AVG: 'rating', alias: 'average_rating' } // Average of ratings with alias
 *   ],
 *   joins: [
 *     { type: 'INNER JOIN', table: 'customers', on: 'orders.customer_id = customers.customer_id' }
 *   ],
 *   groupBy: { orders: ['customer_id'] }, // Grouping by customer_id
 *   having: 'COUNT(order_id) > 5' // Having clause to filter groups
 * });
 * console.log(query);
 * 
 * // Generated SQL query:
 * // SELECT order_id, status, customer_id, COUNT(order_id) AS count, SUM(total_amount) AS summation, AVG(rating) AS average_rating 
 * // FROM orders
 * // INNER JOIN customers ON orders.customer_id = customers.customer_id
 * // WHERE status = "shipped"
 * // GROUP BY customer_id
 * // HAVING COUNT(order_id) > 5
 * // ORDER BY order_date DESC
 * // LIMIT 10 OFFSET 0;
 */
export function selectQuery<Tables extends string[]>(config: SelectQueryParams<Tables>): string;
