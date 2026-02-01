import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

interface EditorState {
    data: string;
    config: string;
    activeFile: 'data' | 'config';
    executeCounter: number;
    isRunning: boolean;
    currentSessionId: string | null;
    currentSessionName: string | null;
}

const initialState: EditorState = {
    data: '[]',
    config: '',
    activeFile: 'data',
    executeCounter: 0,
    isRunning: false,
    currentSessionId: null,
    currentSessionName: null,
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setData: (state, action: PayloadAction<string>) => {
            state.data = action.payload;
        },
        setConfig: (state, action: PayloadAction<string>) => {
            state.config = action.payload;
        },
        setActiveFile: (state, action: PayloadAction<'data' | 'config'>) => {
            state.activeFile = action.payload;
        },
        executeCode: (state) => {
            state.executeCounter += 1;
            state.isRunning = true;
        },
        setRunning: (state, action: PayloadAction<boolean>) => {
            state.isRunning = action.payload;
        },
        setCurrentSession: (state, action: PayloadAction<{id: string; name: string | null}>) => {
            state.currentSessionId = action.payload.id;
            state.currentSessionName = action.payload.name;
        },
        setCurrentSessionName: (state, action: PayloadAction<string | null>) => {
            state.currentSessionName = action.payload;
        },
        clearCurrentSession: (state) => {
            state.currentSessionId = null;
            state.currentSessionName = null;
        },
        resetExecuteCounter: (state) => {
            state.executeCounter = 0;
            state.isRunning = false;
        },
        resetEditor: (state) => {
            state.data = '[]';
            state.config = '';
            state.activeFile = 'data';
            state.executeCounter = 0;
            state.isRunning = false;
            state.currentSessionId = null;
            state.currentSessionName = null;
        },
    },
});

export const {
    setData,
    setConfig,
    setActiveFile,
    executeCode,
    setRunning,
    setCurrentSession,
    setCurrentSessionName,
    clearCurrentSession,
    resetExecuteCounter,
    resetEditor,
} = editorSlice.actions;
export default editorSlice.reducer;
