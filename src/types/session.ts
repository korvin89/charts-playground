export interface EditorSession {
    /** Unique 8-character alphanumeric ID */
    id: string;
    /** Optional custom name (defaults to id if not set) */
    name?: string;
    /** JSON data for the chart */
    data: string;
    /** TypeScript/JavaScript configuration code */
    config: string;
    /** Timestamp when the session was created */
    createdAt: number;
    /** Timestamp when the session was last updated */
    updatedAt: number;
    /** Template ID if the session was created from a template */
    sourceTemplate?: string;
}

export type EditorSessionCreate = Omit<EditorSession, 'id' | 'createdAt' | 'updatedAt'>;
