"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSQL = updateSQL;
const utils_1 = require("./utils");
/**
 * Generates an UPDATE SQL query with flexible options for joins, conditional updates, and additional calculations.
 *
 * This function supports:
 * - CASE WHEN logic for dynamic column updates.
 * - Calculations in the SET clause (e.g., `column = column + 10`).
 * - Subqueries in the SET clause.
 * - Handling NULL and default value assignments.
 * - Join support for multi-table updates.
 * - Sorting and limiting the number of updated rows.
 *
 * @param {Object} params - The parameters to generate the SQL query.
 * @param {string} params.table - The table to update.
 * @param {Array} [params.joins] - Optional: Joins to be included in the query.
 * @param {Object} [params.updateData] - Data for the UPDATE clause. Can include:
 *   - A column-value map, or
 *   - A CASE statement for conditional updates.
 * @param {string} params.where - The WHERE condition for the update.
 * @param {string[]} [params.nullValues] - Optional: List of columns to set to NULL.
 * @param {string[]} [params.defaultValues] - Optional: List of columns to set to their default values.
 * @param {string|number} [params.limit] - Optional: Limit the number of rows to update.
 * @param {Record<string, 1|-1>} [params.sort] - Optional: Sorting criteria (e.g., `{ columnName: 1 }` for ascending).
 * @param {Record<string, string>} [params.fromSubQuery] - Optional: Subqueries for the SET clause.
 * @param {Record<string, string>} [params.setCalculations] - Optional: SET clause calculations (e.g., `{ column: "column + 10" }`).
 *
 * @returns {string} - The generated UPDATE SQL query.
 *
 * @throws {Error} - Throws an error if the `table` or `where` is missing.
 *
 * @example
 * // Example 1: Simple update with conditional CASE WHEN logic
 * const query = updateSQL({
 *   table: 'employees',
 *   updateData: {
 *     salary: {
 *       case: [
 *         { when: "position = 'Manager'", then: 100000 },
 *         { when: "position = 'Developer'", then: 80000 }
 *       ],
 *       default: 50000
 *     }
 *   },
 *   where: 'id = 1'
 * });
 * // Output: UPDATE employees SET salary = CASE WHEN position = 'Manager' THEN 100000
 * //         WHEN position = 'Developer' THEN 80000 ELSE 50000 END WHERE id = 1;
 *
 * @example
 * // Example 2: Update with SET calculations, JOIN, and LIMIT
 * const query = updateSQL({
 *   table: 'products',
 *   updateData: { price: 'price * 1.1' },
 *   where: 'stock > 0',
 *   sort: { name: -1 },
 *   limit: 10,
 *   joins: [
 *     { type: 'INNER JOIN', table: 'categories', on: 'products.category_id = categories.id' }
 *   ]
 * });
 * // Output: UPDATE products INNER JOIN categories ON products.category_id = categories.id
 * //         SET price = price * 1.1 WHERE stock > 0 ORDER BY name DESC LIMIT 10;
 */
function updateSQL({ table = '', joins = [], updateData = {}, where = '', nullValues = [], defaultValues = [], limit, sort, fromSubQuery = {}, setCalculations = {} }) {
    if (!table) {
        throw new Error("⚠️ The `table` parameter is required.");
    }
    if (!where) {
        throw new Error("⚠️ The `where` parameter is required.");
    }
    // Handling the update data and CASE statements
    let updateInfo = Object.entries(updateData)?.map(([column, value]) => {
        // If the value is an object, use a CASE expression for dynamic updates
        if (typeof value === 'object' && value?.hasOwnProperty('case')) {
            const caseStatement = value.case.map((caseCondition) => {
                const { when, then } = caseCondition;
                return `WHEN ${when} THEN ${JSON.stringify(then)}`;
            }).join(' ');
            return `${column} = CASE ${caseStatement} ELSE ${JSON.stringify(value?.default)} END`;
        }
        // Regular update without CASE
        const isNumber = typeof value === 'number' || typeof value === 'boolean';
        const column_value = value;
        const valueString = isNumber ? column_value : column_value?.trim();
        return `${column} = ${isNumber ? valueString : JSON.stringify(valueString)}`;
    }).join(',');
    // Handling SET calculations (e.g., column = column + 10)
    if (Object.keys(setCalculations).length) {
        const calcUpdates = Object.entries(setCalculations).map(([column, calculation]) => {
            return `${column} = ${calculation}`;
        }).join(', ');
        updateInfo += updateInfo ? `, ${calcUpdates}` : calcUpdates;
    }
    // Handling SET with subQuery
    if (Object.keys(fromSubQuery).length) {
        const fromSubQueryUpdates = Object.entries(fromSubQuery).map(([column, calculation]) => {
            return `${column} = ${calculation}`;
        }).join(', ');
        updateInfo += updateInfo ? `, ${fromSubQueryUpdates}` : fromSubQueryUpdates;
    }
    // Handling NULL value assignments
    if (nullValues?.length) {
        const nullAssignments = nullValues.map(column => `${column} = NULL`).join(', ');
        updateInfo += updateInfo ? `, ${nullAssignments}` : nullAssignments;
    }
    // Handling default value assignments
    if (defaultValues?.length) {
        const defaultAssignments = defaultValues.map(column => `${column} = DEFAULT`).join(', ');
        updateInfo += updateInfo ? `, ${defaultAssignments}` : defaultAssignments;
    }
    // Building the JOIN statements if present
    const joinStatements = (0, utils_1.parseJoins)(joins);
    // Constructing the query
    let query = `UPDATE${joinStatements} ${table} SET ${updateInfo}`;
    // Adding WHERE condition if present
    if (where) {
        query += ` WHERE ${where}`;
    }
    // Add sorting if provided
    if (sort) {
        query += (0, utils_1.parseSort)(sort);
    }
    // Adding LIMIT
    if (limit) {
        query += ` LIMIT ${limit}`;
    }
    return query;
}
