import type {EditorSession} from '../types/session';
import {SessionCard} from './SessionCard';

interface SessionListProps {
    sessions: EditorSession[];
    onSelect: (sessionId: string) => void;
    onChange: () => void;
}

export function SessionList({sessions, onSelect, onChange}: SessionListProps) {
    if (sessions.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
            }}
        >
            {sessions.map((session) => (
                <SessionCard
                    key={session.id}
                    session={session}
                    onSelect={onSelect}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}
