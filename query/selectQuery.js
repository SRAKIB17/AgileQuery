"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectQuery = selectQuery;
const utils_1 = require("./utils");
let aggregates_alias = {
    'MIN': 'minimum',
    'MAX': 'maximum',
    'SUM': 'summation',
    'COUNT': 'count',
    'AVG': 'average'
};
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
function selectQuery(config) {
    const { distinct, sort, limitSkip, columns, subQueries, groupBy, recursiveCTE, aggregates, table, where, having, joins, } = config;
    let main_table = table;
    let recursiveCTEQuery = '';
    if (recursiveCTE) {
        const { baseCase, recursiveCase, alias } = recursiveCTE;
        recursiveCTEQuery = `WITH RECURSIVE ${alias} AS (
            ${baseCase}
            UNION ALL
            ${recursiveCase}
        ) `;
        main_table = alias;
    }
    let query = `${recursiveCTEQuery}SELECT `;
    //! DISTINCT
    if (distinct) {
        query += "DISTINCT ";
    }
    let select = '';
    //! SELECT Columns
    if (columns) {
        select = (0, utils_1.parsecolumns)(columns);
    }
    if (subQueries) {
        const subQueryStatement = subQueries
            .map(subQuery => {
                // Build the subquery string with optional alias
                return `(${subQuery.query})${subQuery.as ? ` AS ${subQuery.as}` : ""}`;
            })
            .join(", ");
        select += `${select ? ", " : ""} ${subQueryStatement}`;
    }
    if (aggregates) {
        const aggStrings = aggregates.map((agg) => {
            const { alias, ...functions } = agg; // Destructure the alias and the function
            // Handle the case where there's an alias
            if (alias) {
                const functionStr = Object.entries(functions)
                    .map(([func, column]) => `${func}(${column})`)
                    .join(", ");
                return `${functionStr} AS ${alias}`;
            }
            // Handle case where there's no alias
            const functionStr = Object.entries(functions)
                .map(([func, column]) => {
                    return `${func}(${column}) AS ${aggregates_alias[func] || func}`;
                }).join(", ");
            return functionStr;
        });
        select += `${select ? ", " : ""}${aggStrings.join(", ")}`;
    }
    else {
        select = "*";
    }
    //! FROM Clause
    query += `${select} FROM ${main_table}`;
    //! Joins
    if (joins) {
        query += (0, utils_1.parseJoins)(joins);
    }
    //! WHERE Clause
    if (where) {
        query += ` WHERE ${where}`;
    }
    //! GROUP BY Clause
    if (groupBy) {
        query += (0, utils_1.parseGroupBy)(groupBy) || "";
    }
    //! HAVING Clause
    if (having) {
        query += ` HAVING ${having}`;
    }
    //! ORDER BY Clause
    if (sort) {
        query += (0, utils_1.parseSort)(sort);
    }
    //! LIMIT and OFFSET
    if (limitSkip) {
        if (limitSkip.limit) {
            query += ` LIMIT ${limitSkip.limit}`;
        }
        if (limitSkip.skip) {
            query += ` OFFSET ${limitSkip.skip}`;
        }
    }
    return query.trim();
}
