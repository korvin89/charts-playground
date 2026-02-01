import {Component, StrictMode, useEffect} from 'react';
import type {ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import {Chart} from '@gravity-ui/charts';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

interface ExecuteMessage {
    type: 'EXECUTE_CHART';
    chartConfig: any;
    theme: 'light' | 'dark';
}

interface SandboxError {
    message: string;
    stack?: string;
    line?: number;
    column?: number;
}

// Wrapper component to notify parent of successful render
function ChartWrapper({data, onSuccess}: {data: any; onSuccess: () => void}) {
    useEffect(() => {
        onSuccess();
    }, [onSuccess]);

    return (
        <div style={{width: '100%', height: '100%'}}>
            <Chart data={data} />
        </div>
    );
}

// Error Boundary to catch Chart rendering errors
class ChartErrorBoundary extends Component<
    {children: ReactNode; onError: (error: Error) => void},
    {hasError: boolean}
> {
    static getDerivedStateFromError() {
        return {hasError: true};
    }

    constructor(props: {children: ReactNode; onError: (error: Error) => void}) {
        super(props);
        this.state = {hasError: false};
    }

    componentDidCatch(error: Error) {
        console.error('Chart rendering error caught by ErrorBoundary:', error);
        this.props.onError(error);
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

let root: Root | null = null;
let renderCounter = 0;

// Listen for messages from parent window
window.addEventListener('message', (event: MessageEvent<ExecuteMessage>) => {
    const {type, chartConfig, theme} = event.data;

    if (type !== 'EXECUTE_CHART') return;

    renderCounter++;

    try {
        // Clear previous content
        const container = document.getElementById('chart-container');
        if (!container) {
            throw new Error('Chart container not found');
        }

        // Apply theme to body and configure UIKit
        document.body.style.backgroundColor = theme === 'dark' ? '#222' : '#fff';
        configure({theme: theme || 'light'} as any);

        // chartConfig is already provided by config-sandbox
        const chartData = chartConfig;

        // Create or reuse React root
        if (!root) {
            root = createRoot(container);
        }

        let hasError = false;

        // Handler for chart rendering errors
        const handleChartError = (error: Error) => {
            hasError = true;
            const errorData: SandboxError = {
                message: error.message,
                stack: error.stack,
                line: undefined,
                column: undefined,
            };

            // Try to extract line and column from error stack
            const stackMatch = error.stack?.match(/:(\d+):(\d+)/);
            if (stackMatch) {
                errorData.line = parseInt(stackMatch[1], 10);
                errorData.column = parseInt(stackMatch[2], 10);
            }

            window.parent.postMessage(
                {
                    type: 'CHART_ERROR',
                    error: errorData,
                },
                '*',
            );
        };

        // Handler for successful chart render
        const handleChartSuccess = () => {
            // Only send success if there was no error
            if (!hasError) {
                window.parent.postMessage(
                    {
                        type: 'CHART_SUCCESS',
                    },
                    '*',
                );
            }
        };

        // Render Chart component using React with ErrorBoundary
        // Use key to reset ErrorBoundary state on each render
        root.render(
            <StrictMode>
                <ThemeProvider theme={theme}>
                    <ChartErrorBoundary key={renderCounter} onError={handleChartError}>
                        <ChartWrapper data={chartData} onSuccess={handleChartSuccess} />
                    </ChartErrorBoundary>
                </ThemeProvider>
            </StrictMode>,
        );
    } catch (error) {
        // Parse error details
        const err = error as Error;
        console.error('Error in sandbox:', err);
        const errorData: SandboxError = {
            message: err.message,
            stack: err.stack,
            line: undefined,
            column: undefined,
        };

        // Try to extract line and column from error stack
        const stackMatch = err.stack?.match(/:(\d+):(\d+)/);
        if (stackMatch) {
            errorData.line = parseInt(stackMatch[1], 10);
            errorData.column = parseInt(stackMatch[2], 10);
        }

        // Send error message to parent
        window.parent.postMessage(
            {
                type: 'CHART_ERROR',
                error: errorData,
            },
            '*',
        );
    }
});

// Notify parent that sandbox is ready
window.parent.postMessage({type: 'CHART_SANDBOX_READY'}, '*');
