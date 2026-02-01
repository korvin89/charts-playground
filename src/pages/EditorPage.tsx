import { useEffect, useRef } from 'react';
import { Allotment } from 'allotment';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setData,
  setConfig,
  setActiveFile,
  setRunning,
  setCurrentSession,
  clearCurrentSession,
  resetExecuteCounter,
} from '../store/slices/editorSlice';
import { Editor } from '../components/Editor';
import { ChartPreview } from '../components/ChartPreview';
import { getSession, updateSessionContent } from '../utils/sessionStorage';
import 'allotment/dist/style.css';

export function EditorPage() {
  const dispatch = useAppDispatch();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data, config, activeFile, executeCounter } = useAppSelector(
    (state) => state.editor
  );
  const theme = useAppSelector((state) => state.theme.theme);

  // Track if we're currently loading to prevent auto-save during load
  const isLoadingRef = useRef(true);
  // Track the session ID to detect changes
  const loadedSessionIdRef = useRef<string | null>(null);

  // Load session on mount or when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      navigate('/editor');
      return;
    }

    const session = getSession(sessionId);

    if (!session) {
      // Session not found, redirect to editor home
      navigate('/editor');
      return;
    }

    // Prevent auto-save during initial load
    isLoadingRef.current = true;
    loadedSessionIdRef.current = sessionId;

    // Reset execution state when loading a new session
    // This ensures the Run button works correctly after navigation
    dispatch(resetExecuteCounter());

    // Load session data into Redux
    dispatch(setData(session.data));
    dispatch(setConfig(session.config));
    dispatch(
      setCurrentSession({
        id: session.id,
        name: session.name || null,
      })
    );

    // Allow auto-save after a brief delay
    const timer = setTimeout(() => {
      isLoadingRef.current = false;
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [sessionId, dispatch, navigate]);

  // Clean up session state when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch]);

  // Auto-save to localStorage when data or config changes
  useEffect(() => {
    // Don't save during initial load or if session doesn't match
    if (isLoadingRef.current || loadedSessionIdRef.current !== sessionId) {
      return;
    }

    if (sessionId) {
      updateSessionContent(sessionId, data, config);
    }
  }, [data, config, sessionId]);

  const handleExecutionComplete = () => {
    dispatch(setRunning(false));
  };

  const handleDataChange = (newData: string) => {
    dispatch(setData(newData));
  };

  const handleConfigChange = (newConfig: string) => {
    dispatch(setConfig(newConfig));
  };

  const handleActiveFileChange = (file: 'data' | 'config') => {
    dispatch(setActiveFile(file));
  };

  return (
    <div style={{ height: '100%' }}>
      <Allotment>
        <Allotment.Pane minSize={300}>
          <Editor
            data={data}
            config={config}
            activeFile={activeFile}
            onDataChange={handleDataChange}
            onConfigChange={handleConfigChange}
            onActiveFileChange={handleActiveFileChange}
            theme={theme}
          />
        </Allotment.Pane>

        <Allotment.Pane minSize={300}>
          <ChartPreview
            data={data}
            config={config}
            theme={theme}
            executeCounter={executeCounter}
            onExecutionComplete={handleExecutionComplete}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
