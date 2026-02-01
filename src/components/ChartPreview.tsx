import { useRef, useEffect, useState } from 'react';

interface ChartPreviewProps {
  data: string;
  config: string;
  theme: 'light' | 'dark';
  executeCounter: number;
  onExecutionComplete: () => void;
}

interface ChartPreviewError {
  message: string;
  stack?: string;
  line?: number;
  column?: number;
}

export function ChartPreview({
  data,
  config,
  theme,
  executeCounter,
  onExecutionComplete,
}: ChartPreviewProps) {
  const configIframeRef = useRef<HTMLIFrameElement>(null);
  const chartIframeRef = useRef<HTMLIFrameElement>(null);

  const [configSandboxReady, setConfigSandboxReady] = useState(false);
  const [chartSandboxReady, setChartSandboxReady] = useState(false);

  const [error, setError] = useState<ChartPreviewError | null>(null);
  const [errorSource, setErrorSource] = useState<'config' | 'chart' | null>(null);
  const [hasExecuted, setHasExecuted] = useState(false);

  const dataRef = useRef(data);
  const configRef = useRef(config);

  // Update refs when props change
  useEffect(() => {
    dataRef.current = data;
    configRef.current = config;
  }, [data, config]);

  // Handle messages from both iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, chartConfig, error: errorData } = event.data;

      switch (type) {
        case 'CONFIG_SANDBOX_READY':
          console.log('[PREVIEW] Config sandbox is ready');
          setConfigSandboxReady(true);
          break;

        case 'CHART_SANDBOX_READY':
          console.log('[PREVIEW] Chart sandbox is ready');
          setChartSandboxReady(true);
          break;

        case 'CONFIG_SUCCESS':
          console.log('[PREVIEW] Config executed successfully, sending to chart sandbox');
          setError(null);
          setErrorSource(null);

          // Send chartConfig to chart sandbox
          if (chartIframeRef.current?.contentWindow && chartSandboxReady) {
            chartIframeRef.current.contentWindow.postMessage(
              {
                type: 'EXECUTE_CHART',
                chartConfig,
                theme,
              },
              '*'
            );
          }
          break;

        case 'CONFIG_ERROR':
          console.log('[PREVIEW] Config execution error:', errorData);
          setError(errorData);
          setErrorSource('config');
          onExecutionComplete();
          break;

        case 'CHART_SUCCESS':
          console.log('[PREVIEW] Chart rendered successfully');
          setError(null);
          setErrorSource(null);
          onExecutionComplete();
          break;

        case 'CHART_ERROR':
          console.log('[PREVIEW] Chart render error:', errorData);
          setError(errorData);
          setErrorSource('chart');
          onExecutionComplete();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [chartSandboxReady, theme, onExecutionComplete]);

  // Execute when executeCounter changes (Run button clicked)
  useEffect(() => {
    if (executeCounter > 0 && configSandboxReady && chartSandboxReady) {
      console.log('[PREVIEW] Starting execution, counter:', executeCounter);
      setError(null);
      setErrorSource(null);
      setHasExecuted(true);

      // Send data + config to config sandbox
      configIframeRef.current?.contentWindow?.postMessage(
        {
          type: 'EXECUTE_CONFIG',
          data: dataRef.current,
          config: configRef.current,
        },
        '*'
      );
    }
  }, [executeCounter, configSandboxReady, chartSandboxReady]);

  // Re-execute when theme changes (if already executed)
  useEffect(() => {
    if (hasExecuted && configSandboxReady && chartSandboxReady && executeCounter > 0) {
      console.log('[PREVIEW] Theme changed, re-executing');
      setError(null);
      setErrorSource(null);

      configIframeRef.current?.contentWindow?.postMessage(
        {
          type: 'EXECUTE_CONFIG',
          data: dataRef.current,
          config: configRef.current,
        },
        '*'
      );
    }
  }, [theme, hasExecuted, configSandboxReady, chartSandboxReady, executeCounter]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Config sandbox iframe (hidden) */}
      <iframe
        ref={configIframeRef}
        src="/config-sandbox-iframe.html"
        sandbox="allow-scripts allow-same-origin"
        style={{ display: 'none' }}
        title="Config Sandbox"
      />

      {/* Chart sandbox iframe (visible) */}
      <iframe
        ref={chartIframeRef}
        src="/chart-sandbox-iframe.html"
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: error ? 'none' : 'block',
        }}
        title="Chart Sandbox"
      />

      {/* Initial message overlay */}
      {!hasExecuted && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
            color: theme === 'dark' ? '#ccc' : '#666',
            fontSize: '16px',
          }}
        >
          Click "Run" to execute your code
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: '24px',
            backgroundColor: theme === 'dark' ? '#222' : '#fff',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: theme === 'dark' ? '#3c1f1f' : '#fee',
              border: `2px solid ${theme === 'dark' ? '#8b0000' : '#c00'}`,
              borderRadius: '8px',
              color: theme === 'dark' ? '#ff6b6b' : '#c00',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>
              {errorSource === 'config' ? 'Config Execution Error' : 'Chart Render Error'}
            </div>
            <div style={{ marginBottom: '8px' }}>{error.message}</div>
            {error.line && (
              <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                Line {error.line}
                {error.column && `:${error.column}`}
              </div>
            )}
            {error.stack && (
              <details open style={{ marginTop: '12px' }}>
                <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Stack trace
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
