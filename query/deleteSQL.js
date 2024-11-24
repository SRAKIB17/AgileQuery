"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSQL = deleteSQL;
const utils_1 = require("./utils");
/**
 * Generates a DELETE SQL query with optional WHERE condition, joins, sorting, and limiting the number of deleted rows.
 *
 * This function supports:
 * - Deleting rows from a specified table with a WHERE condition.
 * - Adding JOINs to delete rows based on conditions from related tables.
 * - Sorting the rows to be deleted.
 * - Limiting the number of rows deleted.
 *
 * @param {Object} params - The parameters to generate the SQL query.
 * @param {string} params.table - The table to delete rows from.
 * @param {string} params.where - The condition for the DELETE statement (WHERE clause).
 * @param {Record<string, 1 | -1>} [params.sort] - Optional: Sorting criteria (e.g., `{ columnName: 1 }` for ascending).
 * @param {string | number} [params.limit] - Optional: Limit the number of rows to delete.
 * @param {JoinsType} [params.joins] - Optional: Joins to be included in the query.
 *
 * @returns {string} - The generated DELETE SQL query.
 *
 * @throws {Error} - Throws an error if the `table` or `where` parameters are missing.
 *
 * @example
 * // Example: Simple DELETE query with WHERE condition and LIMIT
 * const query = deleteSQL({
 *   table: 'employees',
 *   where: 'age > 60',
 *   limit: 10
 * });
 * // Output: DELETE employees FROM employees WHERE age > 60 LIMIT 10;
 *
 * @example
 * // Example: DELETE query with JOINs and sorting
 * const query = deleteSQL({
 *   table: 'orders',
 *   where: 'status = "pending"',
 *   sort: { order_date: -1 },
 *   joins: [
 *     { type: 'INNER JOIN', table: 'customers', on: 'orders.customer_id = customers.id' }
 *   ]
 * });
 * // Output: DELETE orders FROM orders INNER JOIN customers ON orders.customer_id = customers.id WHERE status = "pending" ORDER BY order_date DESC;
 */
function deleteSQL({ table, where, joins, limit, sort, }) {
    // Ensure required parameters are provided
    if (!table) {
        throw new Error("⚠️ The `table` parameter is required.");
    }
    if (!where) {
        throw new Error("⚠️ The `where` parameter is required.");
    }
    // Base query for DELETE
    let query = `DELETE ${table} FROM ${table}`;
    // Add joins if provided
    query += joins ? (0, utils_1.parseJoins)(joins) : "";
    // Add condition if specified (WHERE clause)
    if (where) {
        query += ` WHERE ${where}`;
    }
    // Add sorting if provided
    if (sort) {
        query += (0, utils_1.parseSort)(sort);
    }
    // Add LIMIT if provided
    if (limit) {
        query += ` LIMIT ${limit}`;
    }
    return query;
}
