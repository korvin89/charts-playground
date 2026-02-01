import type { EditorSession, EditorSessionCreate } from '../types/session';
import { templates } from '../templates';
import { loadStateFromUrl } from './urlState';

const STORAGE_KEY = 'charts-editor-sessions';

/**
 * Generate a random 8-character alphanumeric ID
 */
export function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Get all sessions from localStorage, sorted by updatedAt (newest first)
 */
export function getAllSessions(): EditorSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const sessions: EditorSession[] = JSON.parse(data);
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    console.error('Failed to load sessions from localStorage');
    return [];
  }
}

/**
 * Get a single session by ID
 */
export function getSession(id: string): EditorSession | null {
  const sessions = getAllSessions();
  return sessions.find((s) => s.id === id) || null;
}

/**
 * Save a session to localStorage (creates or updates)
 */
export function saveSession(session: EditorSession): void {
  try {
    const sessions = getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: Date.now() };
    } else {
      sessions.push(session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

/**
 * Delete a session from localStorage
 */
export function deleteSession(id: string): void {
  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete session from localStorage:', error);
  }
}

/**
 * Rename a session
 */
export function renameSession(id: string, name: string): void {
  const session = getSession(id);
  if (session) {
    saveSession({ ...session, name, updatedAt: Date.now() });
  }
}

/**
 * Update session data and config
 */
export function updateSessionContent(
  id: string,
  data: string,
  config: string
): void {
  const session = getSession(id);
  if (session) {
    saveSession({ ...session, data, config, updatedAt: Date.now() });
  }
}

/**
 * Create a new session from a template
 */
export function createSessionFromTemplate(templateId: string): EditorSession {
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const now = Date.now();
  const session: EditorSession = {
    id: generateSessionId(),
    data: template.data,
    config: template.config,
    createdAt: now,
    updatedAt: now,
    sourceTemplate: templateId,
  };

  saveSession(session);
  return session;
}

/**
 * Create a new session from URL parameters (for share links)
 */
export function createSessionFromUrl(): EditorSession | null {
  const urlState = loadStateFromUrl();

  if (!urlState.data || !urlState.config) {
    return null;
  }

  const now = Date.now();
  const session: EditorSession = {
    id: generateSessionId(),
    data: urlState.data,
    config: urlState.config,
    createdAt: now,
    updatedAt: now,
  };

  saveSession(session);
  return session;
}

/**
 * Create a new empty session
 */
export function createEmptySession(): EditorSession {
  const now = Date.now();
  const session: EditorSession = {
    id: generateSessionId(),
    data: `[
  { "x": 1, "y": 10 },
  { "x": 2, "y": 20 },
  { "x": 3, "y": 30 }
]`,
    config: `const data = getData();

const chartConfig = {
  series: {
    data: [
      {
        type: 'line',
        data: data,
        name: 'My Series'
      }
    ]
  },
  xAxis: {
    type: 'linear'
  },
  yAxis: [{}],
  title: {
    text: 'My Chart'
  }
};`,
    createdAt: now,
    updatedAt: now,
    sourceTemplate: 'empty',
  };

  saveSession(session);
  return session;
}

/**
 * Create a session from custom data
 */
export function createSession(input: EditorSessionCreate): EditorSession {
  const now = Date.now();
  const session: EditorSession = {
    ...input,
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
  };

  saveSession(session);
  return session;
}

/**
 * Get display name for a session (name or id)
 */
export function getSessionDisplayName(session: EditorSession): string {
  return session.name || session.id;
}
