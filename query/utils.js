"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSort = parseSort;
exports.parseGroupBy = parseGroupBy;
exports.parseJoins = parseJoins;
exports.parsecolumns = parsecolumns;
function parseSort(sort) {
    if (!sort)
        return '';
    // Handle the case where sort is a simple string
    if (typeof sort === "string") {
        return ` ORDER BY ${sort}`;
    }
    // Handle the case where sort is a Record<string, 1 | -1>
    if (typeof sort === "object") {
        const entries = Object.entries(sort);
        if (entries.length) {
            const query = entries.map(r => {
                const [table, columns] = r;
                if (typeof columns == 'number') {
                    return `${table} ${columns === 1 ? "ASC" : "DESC"}`;
                }
                if (typeof columns === "object") {
                    return Object.entries(columns)?.map(([column, direction]) => `${table}.${column} ${direction === 1 ? "ASC" : "DESC"}`)?.join(", ");
                }
                return '';
            }).filter(Boolean).join(", ");
            return ` ORDER BY ${query}`;
        }
    }
    return '';
}
function parseGroupBy(groupBy) {
    if (!groupBy)
        return '';
    // Case 1: `groupBy` is a simple string
    if (typeof groupBy === "string") {
        return ` GROUP BY ${groupBy}`;
    }
    // Case 2: `groupBy` is an array of strings
    if (Array.isArray(groupBy)) {
        return ` GROUP BY ${groupBy.join(", ")}`;
    }
    // Case 3: `groupBy` is an object
    if (typeof groupBy === "object") {
        const clauses = [];
        // Handle table-specific arrays
        Object.entries(groupBy).forEach(([table, columns]) => {
            if (table === "extra") {
                return clauses.push(Array.isArray(columns)
                    ? columns.join(", ")
                    : table);
            }
            ; // Skip `extra` field
            if (Array.isArray(columns)) {
                clauses.push(...columns.map(column => `${table}.${column}`));
            }
        });
        return clauses.length > 0 ? ` GROUP BY ${clauses.join(", ")}` : "";
    }
    return '';
}
function parseJoins(joins) {
    if (!joins || joins.length === 0)
        return '';
    const joinClauses = joins?.map((join) => {
        if ('type' in join) {
            // Case 1: Join with `type`, `on`, and `operator`
            const { type, on, operator = '=', ...tables } = join;
            const tableEntries = Object?.entries(tables || {}).filter(([key]) => key !== "type" && key !== "on" && key !== "operator");
            if (on && tableEntries?.length) {
                const table = join?.table;
                // If `on` is explicitly provided, use it directly
                return ` ${type} ${table || tableEntries?.[0]?.[0]} ON ${on}`;
            }
            if (tableEntries.length !== 2) {
                throw new Error(`❌JOIN requires exactly two tables for a relation, but found ${tableEntries.length} or condition not found`);
            }
            const [[table1, column1], [table2, column2]] = tableEntries;
            return ` ${type} ${table2} ON ${table1}.${column1} ${operator} ${table2}.${column2}`;
        }
        else {
            // Case 2: Shorthand form (logging details as requested)
            const tableEntries = Object.entries(join).filter(([key]) => key !== "type" && key !== "on" && key !== "operator");
            if ('on' in join && tableEntries?.length) {
                const { on, operator = '=', ...tables } = join;
                return ` JOIN ${join?.table || tableEntries?.[0]?.[0]} ON ${on}`;
            }
            // If there are not exactly 2 table-column pairs, raise an error
            if (tableEntries.length !== 2) {
                throw new Error(`❌ JOIN shorthand requires exactly two tables, but found ${tableEntries.length} or condition not found`);
            }
            // Deconstruct the table-column pairs
            const [[table1, column1], [table2, column2]] = tableEntries;
            return ` JOIN ${table2} ON ${table1}.${column1} = ${table2}.${column2}`;
        }
    });
    return joinClauses.join(" ");
}
function parsecolumns(columns) {
    if (!columns)
        return '';
    // Case 1: `groupBy` is a simple string
    if (typeof columns === "string") {
        return columns;
    }
    // Case 2: `groupBy` is an array of strings
    if (Array.isArray(columns)) {
        return columns.join(", ");
    }
    // Case 3: `groupBy` is an object
    if (typeof columns === "object") {
        const clauses = [];
        // Handle table-specific arrays
        Object.entries(columns).forEach(([table, columns]) => {
            if (table === "extra") {
                return clauses.push(Array.isArray(columns)
                    ? columns.join(", ")
                    : table);
            }
            ; // Skip `extra` field
            if (Array.isArray(columns)) {
                clauses.push(...columns.map(column => `${table}.${column}`));
            }
        });
        return clauses.length > 0 ? clauses.join(", ") : "";
    }
    return '';
}
