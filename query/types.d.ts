
export type JoinsType<Tables extends string[]> = Array<{
    operator?: OperatorType | string,
    type?: 'JOIN' | 'INNER JOIN' | 'OUTER JOIN' | 'CROSS JOIN' | 'RIGHT JOIN' | 'LEFT JOIN';
} | {
    on?: string, table?: string
} | {
    [key: string]: string
} | {
    [P in Tables[number]]?: string
}>

export type SortType<Tables extends string[]> = { [P in Tables[number]]?: Record<string, 1 | -1> } | Record<string, 1 | -1> | string

export type OperatorType =
    | '='    // Equality
    | '!='   // Not equal (ANSI SQL standard)
    | '<>'   // Not equal (alternate syntax)
    | '<'    // Less than
    | '>'    // Greater than
    | '<='   // Less than or equal
    | '>='   // Greater than or equal
    | 'LIKE' // Pattern matching
    | 'IN'   // Check if value exists in a set
    | 'BETWEEN'; // Range condition
