import {useCallback, useState} from 'react';
import {Accordion, Card, Flex, Icon, Text} from '@gravity-ui/uikit';
import {CircleCheck, CircleInfo, CircleXmark} from '@gravity-ui/icons';
import {useNavigate} from 'react-router-dom';
import {templates} from '../templates';
import {
    createEmptySession,
    createSessionFromTemplate,
    getAllSessions,
} from '../utils/sessionStorage';
import {SessionList} from '../components/SessionList';

export function SandboxHomePage() {
    const navigate = useNavigate();
    // Use state to trigger re-renders when sessions change
    const [, setUpdateKey] = useState(0);
    const sessions = getAllSessions();

    const handleSelectTemplate = (templateId: string) => {
        const session = createSessionFromTemplate(templateId);
        navigate(`/sandbox/${session.id}`);
    };

    const handleCreateEmpty = () => {
        const session = createEmptySession();
        navigate(`/sandbox/${session.id}`);
    };

    const handleSessionSelect = (sessionId: string) => {
        navigate(`/sandbox/${sessionId}`);
    };

    const handleSessionsChange = useCallback(() => {
        // Increment key to force re-render and re-fetch sessions
        setUpdateKey((k) => k + 1);
    }, []);

    return (
        <div style={{padding: '32px 24px'}}>
            {/* Hero Section */}
            <div style={{marginBottom: '32px'}}>
                <Text variant="display-2" as="h1" style={{display: 'block', marginBottom: '8px'}}>
                    Sandbox
                </Text>
                <Text variant="body-2" color="secondary" as="p">
                    Create interactive charts using @gravity-ui/charts library. Edit JSON data and
                    TypeScript configuration, then see your chart rendered instantly.
                </Text>
            </div>

            {/* Documentation */}
            <div style={{marginBottom: '32px'}}>
                <Accordion size="l" multiple>
                    <Accordion.Item
                        value="how-it-works"
                        summary={
                            <Flex gap={2} alignItems="center">
                                <Icon
                                    data={CircleInfo}
                                    style={{color: 'var(--g-color-text-info)'}}
                                />
                                How it works
                            </Flex>
                        }
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '32px',
                                padding: '8px 0',
                            }}
                        >
                            <div>
                                <Text
                                    variant="subheader-1"
                                    as="h3"
                                    style={{display: 'block', marginBottom: '8px'}}
                                >
                                    1. Data (data.json)
                                </Text>
                                <Text variant="body-2" color="secondary" as="p">
                                    Define your chart data in JSON format. This can be an array of
                                    points or an object with multiple series.
                                </Text>
                            </div>
                            <div>
                                <Text
                                    variant="subheader-1"
                                    as="h3"
                                    style={{display: 'block', marginBottom: '8px'}}
                                >
                                    2. Config (config.ts)
                                </Text>
                                <Text variant="body-2" color="secondary" as="p">
                                    Write TypeScript code that uses{' '}
                                    <code
                                        style={{
                                            backgroundColor: 'var(--g-color-base-generic)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        getData()
                                    </code>{' '}
                                    and defines a{' '}
                                    <code
                                        style={{
                                            backgroundColor: 'var(--g-color-base-generic)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        chartConfig
                                    </code>{' '}
                                    variable with chart options.
                                </Text>
                            </div>
                            <div>
                                <Text
                                    variant="subheader-1"
                                    as="h3"
                                    style={{display: 'block', marginBottom: '8px'}}
                                >
                                    3. Run
                                </Text>
                                <Text variant="body-2" color="secondary" as="p">
                                    Click "Run" to execute your config and render the chart. Changes
                                    are auto-saved to your browser.
                                </Text>
                            </div>
                        </div>
                    </Accordion.Item>

                    <Accordion.Item
                        value="what-you-can-do"
                        summary={
                            <Flex gap={2} alignItems="center">
                                <Icon
                                    data={CircleCheck}
                                    style={{color: 'var(--g-color-text-positive)'}}
                                />
                                What you can do
                            </Flex>
                        }
                    >
                        <div style={{padding: '8px 0'}}>
                            <ul
                                style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Use{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            getData()
                                        </code>{' '}
                                        to access your JSON data
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Use built-in objects:{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Math
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Date
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Array
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Object
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            JSON
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            String
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Number
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Boolean
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            console
                                        </code>
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Use array methods:{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            map
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            filter
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            reduce
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            sort
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            find
                                        </code>
                                        , etc.
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Create intermediate variables for data transformation
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Use TypeScript type annotations (they will be stripped
                                        before execution)
                                    </Text>
                                </li>
                            </ul>
                        </div>
                    </Accordion.Item>

                    <Accordion.Item
                        value="what-you-cannot-do"
                        summary={
                            <Flex gap={2} alignItems="center">
                                <Icon
                                    data={CircleXmark}
                                    style={{color: 'var(--g-color-text-danger)'}}
                                />
                                What you cannot do
                            </Flex>
                        }
                    >
                        <div style={{padding: '8px 0'}}>
                            <ul
                                style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Make network requests ({' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            fetch
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            XMLHttpRequest
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            WebSocket
                                        </code>
                                        ) — all data must be in data.json
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Define custom functions with{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            function
                                        </code>{' '}
                                        keyword — use arrow functions in callbacks instead
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Access browser APIs ({' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            window
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            document
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            location
                                        </code>
                                        )
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Use storage ({' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            localStorage
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            sessionStorage
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            indexedDB
                                        </code>
                                        )
                                    </Text>
                                </li>
                                <li>
                                    <Text variant="body-2" color="secondary">
                                        Use timers ({' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            setTimeout
                                        </code>
                                        ,{' '}
                                        <code
                                            style={{
                                                backgroundColor: 'var(--g-color-base-generic)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            setInterval
                                        </code>
                                        )
                                    </Text>
                                </li>
                            </ul>
                        </div>
                    </Accordion.Item>
                </Accordion>
            </div>

            {/* Recent Sessions */}
            <div style={{marginBottom: '48px'}}>
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    style={{marginBottom: '16px'}}
                >
                    <Text variant="header-1">Recent Sessions</Text>
                </Flex>
                {sessions.length > 0 ? (
                    <SessionList
                        sessions={sessions}
                        onSelect={handleSessionSelect}
                        onChange={handleSessionsChange}
                    />
                ) : (
                    <Card style={{padding: '32px', textAlign: 'center'}}>
                        <Text variant="body-2" color="secondary">
                            No sessions yet. Create one from a template below or start with an empty
                            sandbox.
                        </Text>
                    </Card>
                )}
            </div>

            {/* Templates */}
            <div>
                <Text variant="header-1" style={{display: 'block', marginBottom: '16px'}}>
                    Templates
                </Text>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <Card type="action" style={{padding: '20px'}} onClick={handleCreateEmpty}>
                        <Text variant="subheader-2" style={{display: 'block', marginBottom: '8px'}}>
                            Empty Sandbox
                        </Text>
                        <Text variant="body-2" color="secondary" style={{display: 'block'}}>
                            Start from scratch
                        </Text>
                    </Card>
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            type="action"
                            style={{padding: '20px'}}
                            onClick={() => handleSelectTemplate(template.id)}
                        >
                            <Text
                                variant="subheader-2"
                                style={{display: 'block', marginBottom: '8px'}}
                            >
                                {template.name}
                            </Text>
                            <Text variant="body-2" color="secondary" style={{display: 'block'}}>
                                {template.description}
                            </Text>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
