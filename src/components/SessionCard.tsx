import {useState} from 'react';
import {Button, Card, Dialog, DropdownMenu, Icon, Label, Text, TextInput} from '@gravity-ui/uikit';
import {Ellipsis, Pencil, TrashBin} from '@gravity-ui/icons';
import type {EditorSession} from '../types/session';
import {deleteSession, getSessionDisplayName, renameSession} from '../utils/sessionStorage';
import {getChartTypeLabels} from '../utils/chartAnalyzer';

interface SessionCardProps {
    session: EditorSession;
    onSelect: (sessionId: string) => void;
    onChange: () => void;
}

export function SessionCard({session, onSelect, onChange}: SessionCardProps) {
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newName, setNewName] = useState(session.name || '');

    const displayName = getSessionDisplayName(session);
    const chartTypeLabels = getChartTypeLabels(session.config);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
        } else if (days === 1) {
            return `Yesterday at ${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleRename = () => {
        if (newName.trim()) {
            renameSession(session.id, newName.trim());
            onChange();
        }
        setRenameOpen(false);
    };

    const handleDelete = () => {
        deleteSession(session.id);
        onChange();
        setDeleteOpen(false);
    };

    const menuItems = [
        {
            action: () => {
                setNewName(session.name || '');
                setRenameOpen(true);
            },
            text: 'Rename',
            icon: <Icon data={Pencil} size={16} />,
        },
        {
            action: () => setDeleteOpen(true),
            text: 'Delete',
            icon: <Icon data={TrashBin} size={16} />,
            theme: 'danger' as const,
        },
    ];

    return (
        <>
            <Card
                style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div
                    style={{flex: 1, minWidth: 0, cursor: 'pointer'}}
                    onClick={() => onSelect(session.id)}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                        }}
                    >
                        <Text variant="subheader-1" ellipsis style={{maxWidth: '200px'}}>
                            {displayName}
                        </Text>
                        {chartTypeLabels.map((label) => (
                            <Label key={label} size="xs" theme="info">
                                {label}
                            </Label>
                        ))}
                    </div>
                    <Text variant="caption-1" color="secondary">
                        {formatDate(session.updatedAt)}
                    </Text>
                </div>
                <DropdownMenu
                    items={menuItems}
                    renderSwitcher={(props) => (
                        <Button {...props} view="flat" size="s">
                            <Icon data={Ellipsis} />
                        </Button>
                    )}
                />
            </Card>

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
                <Dialog.Header caption="Rename Session" />
                <Dialog.Body>
                    <TextInput
                        value={newName}
                        onUpdate={setNewName}
                        placeholder="Enter session name"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRename();
                            }
                        }}
                    />
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setRenameOpen(false)}
                    onClickButtonApply={handleRename}
                    textButtonApply="Rename"
                    textButtonCancel="Cancel"
                />
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <Dialog.Header caption="Delete Session" />
                <Dialog.Body>
                    <Text>
                        Are you sure you want to delete session "{displayName}"? This action cannot
                        be undone.
                    </Text>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setDeleteOpen(false)}
                    onClickButtonApply={handleDelete}
                    textButtonApply="Delete"
                    textButtonCancel="Cancel"
                    propsButtonApply={{view: 'outlined-danger'}}
                />
            </Dialog>
        </>
    );
}
