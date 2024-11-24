"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertQuery = insertQuery;
/**
 * Generates an INSERT SQL query with optional date handling, unique constraints, and support for `ON DUPLICATE KEY UPDATE`.
 *
 * This function can handle both single-row and multi-row insertions. It supports:
 * - Adding timestamp fields (e.g., `created_at`, `updated_at`) automatically.
 * - Avoiding duplicate entries with a unique column (`INSERT IGNORE`).
 * - Updating specific fields if a duplicate key conflict occurs (`ON DUPLICATE KEY UPDATE`).
 *
 * @param {Object} params - The parameters for generating the INSERT SQL query.
 * @param {string} params.table - The name of the table into which the data will be inserted.
 *                                 This is required and represents the target table in the database.
 * @param {Record<string, string | number> | Array<Record<string, string | number>>} params.insertData
 *                 - The data to be inserted into the table. This can be:
 *                     - A single object: `{ column1: value1, column2: value2 }`.
 *                     - An array of objects for multi-row insertions:
 *                       `[ { column1: value1 }, { column1: value2 } ]`.
 * @param {Array<string>} [params.dateFields] - An optional list of timestamp column names (e.g., `['created_at']`).
 *                                              For each column, `CURRENT_TIMESTAMP` will be added automatically.
 * @param {string | null} [params.uniqueColumn] - The name of a unique column to prevent duplicate entries.
 *                                                 When specified, the query will use `INSERT IGNORE`.
 *                                                 Defaults to `null` (no unique constraint).
 * @param {Array<string>} [params.onDuplicateUpdateFields] - A list of column names to update if a duplicate key occurs.
 *                                                           When provided, `ON DUPLICATE KEY UPDATE` will be used.
 *                                                           Defaults to an empty array (no updates).
 *
 * @returns {string} - The generated INSERT SQL query as a string.
 *
 * @throws {Error} - Throws an error if `insertData` is empty or invalid.
 *
 * @example
 * // Example 1: Insert a single row with timestamps
 * const query = insertQuery({
 *   table: 'users',
 *   insertData: { name: 'John', email: 'john@example.com' },
 *   dateFields: ['created_at', 'updated_at']
 * });
 * // Output: INSERT INTO users (name, email, created_at, updated_at)
 * //         VALUES ('John', 'john@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
 *
 * @example
 * // Example 2: Insert multiple rows with `ON DUPLICATE KEY UPDATE`
 * const query = insertQuery({
 *   table: 'products',
 *   insertData: [
 *     { name: 'Laptop', price: 1000 },
 *     { name: 'Phone', price: 500 }
 *   ],
 *   uniqueColumn: 'name',
 *   onDuplicateUpdateFields: ['price']
 * });
 * // Output: INSERT INTO products (name, price)
 * //         VALUES ('Laptop', 1000), ('Phone', 500)
 * //         ON DUPLICATE KEY UPDATE price = VALUES(price);
 */
function insertQuery({ table, insertData, dateFields, uniqueColumn = null, onDuplicateUpdateFields = [] }) {
    // Array to hold timestamp values, initialized as undefined
    let date;
    if (dateFields?.length) {
        date = new Array(dateFields.length).fill('CURRENT_TIMESTAMP');
    }
    // Validate `insertData` is not empty
    if (!insertData) {
        throw new Error('❌ Insert data array is empty');
    }
    let columns = '';
    let values = '';
    if (Array.isArray(insertData)) {
        // Handle multi-row insertion
        columns = `(${Object.keys(insertData[0]).join(', ')}${date ? `,${dateFields?.join(', ')}` : ''})`;
        values = insertData
            .map(row => `(${JSON.stringify(Object.values(row)).slice(1, -1)}${date ? `, ${date.join(", ")}` : ''})`)
            .join(', ');
    }
    else {
        // Handle single-row insertion
        columns = `(${Object.keys(insertData).join(', ')}${date ? `,${dateFields?.join(", ")}` : ''})`;
        values = `(${JSON.stringify(Object.values(insertData)).slice(1, -1)}${date ? `,${date.join(", ")}` : ''})`;
    }
    let sql = '';
    if (uniqueColumn) {
        // Generate `INSERT IGNORE` query to prevent duplicates
        sql = `INSERT IGNORE INTO ${table} ${columns} VALUES ${values}`;
    }
    else if (onDuplicateUpdateFields.length > 0) {
        // Generate `ON DUPLICATE KEY UPDATE` query
        const updateFields = onDuplicateUpdateFields.map(field => `${field} = VALUES(${field})`).join(', ');
        sql = `INSERT INTO ${table} ${columns} VALUES ${values} ON DUPLICATE KEY UPDATE ${updateFields}`;
    }
    else {
        // Generate a standard `INSERT` query
        sql = `INSERT INTO ${table} ${columns} VALUES ${values}`;
    }
    return sql;
}
