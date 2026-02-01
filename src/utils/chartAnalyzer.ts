/**
 * Analyzes chart config code to extract series types
 */

export interface SeriesTypeInfo {
    type: string;
    count: number;
}

/**
 * Extract series types from config code using regex
 * Looks for patterns like: type: 'line', type: "bar-y", etc.
 */
export function extractSeriesTypes(config: string): SeriesTypeInfo[] {
    // Match type: 'value' or type: "value" patterns
    const typeRegex = /type\s*:\s*['"]([^'"]+)['"]/g;
    const typeCounts = new Map<string, number>();

    let match;
    while ((match = typeRegex.exec(config)) !== null) {
        const type = match[1];
        // Filter out known chart series types
        if (isSeriesType(type)) {
            typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        }
    }

    // Convert to array and sort by count (descending)
    return Array.from(typeCounts.entries())
        .map(([type, count]) => ({type, count}))
        .sort((a, b) => b.count - a.count);
}

/**
 * Check if a type string is a known chart series type
 */
function isSeriesType(type: string): boolean {
    const knownTypes = ['line', 'area', 'bar-x', 'bar-y', 'pie', 'scatter', 'treemap', 'waterfall'];
    return knownTypes.includes(type);
}

/**
 * Format series types for display
 * Examples:
 * - [{ type: 'line', count: 1 }] -> ['line']
 * - [{ type: 'line', count: 2 }] -> ['2 line']
 * - [{ type: 'line', count: 1 }, { type: 'bar-y', count: 1 }] -> ['line', 'bar-y']
 */
export function formatSeriesTypes(types: SeriesTypeInfo[]): string[] {
    return types.map(({type, count}) => {
        if (count > 1) {
            return `${count} ${type}`;
        }
        return type;
    });
}

/**
 * Get display labels for chart series types from config
 */
export function getChartTypeLabels(config: string): string[] {
    const types = extractSeriesTypes(config);
    return formatSeriesTypes(types);
}
