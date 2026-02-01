import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: Error) => void;
  theme: 'light' | 'dark';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when children change (new data)
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { theme } = this.props;
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: theme === 'dark' ? '#3c1f1f' : '#fee',
            borderLeft: `4px solid ${theme === 'dark' ? '#8b0000' : '#c00'}`,
            color: theme === 'dark' ? '#ff6b6b' : '#c00',
            fontFamily: 'monospace',
            fontSize: '13px',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>
            Chart Render Error
          </div>
          <div style={{ marginBottom: '8px' }}>
            {this.state.error.message}
          </div>
          {this.state.error.stack && (
            <details open style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', userSelect: 'none', marginBottom: '8px' }}>
                Stack trace
              </summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '11px',
                  backgroundColor: theme === 'dark' ? '#2a1515' : '#fdd',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
