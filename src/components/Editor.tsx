import {useEffect, useRef, useState} from 'react';
import {Editor as MonacoEditor} from '@monaco-editor/react';
import {Tab, TabList} from '@gravity-ui/uikit';
import {chartTypeDefinitions} from '../utils/chartTypes';

// JSON file icon
const JsonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#cbcb41">
        <path d="M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2m-7 12a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1z" />
    </svg>
);

// TypeScript file icon
const TypeScriptIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3178c6">
        <path d="M3 3h18v18H3V3m10.71 14.86c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8M13 11.25H8v1.5h1.5V20h1.75v-7.25H13v-1.5z" />
    </svg>
);

interface EditorProps {
    data: string;
    config: string;
    activeFile: 'data' | 'config';
    onDataChange: (value: string) => void;
    onConfigChange: (value: string) => void;
    onActiveFileChange: (file: 'data' | 'config') => void;
    theme: 'light' | 'dark';
}

export function Editor({
    data,
    config,
    activeFile,
    onDataChange,
    onConfigChange,
    onActiveFileChange,
    theme,
}: EditorProps) {
    const [dataModel, setDataModel] = useState<any>(null);
    const [configModel, setConfigModel] = useState<any>(null);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

    // Handle editor mount
    const handleEditorMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Configure TypeScript compiler options
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            allowJs: true,
            strict: false,
            noImplicitAny: false,
        });

        // Add chart type definitions for autocompletion
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            chartTypeDefinitions,
            'file:///node_modules/@types/charts-sandbox/index.d.ts',
        );

        // Disable some diagnostics for sandbox environment
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
            // Ignore some errors that don't make sense in sandbox context
            diagnosticCodesToIgnore: [
                2304, // Cannot find name (for getData when not properly resolved)
                2451, // Cannot redeclare block-scoped variable
                7006, // Parameter implicitly has 'any' type
            ],
        });

        const dataUri = monaco.Uri.parse('inmemory://model/data.json');
        const configUri = monaco.Uri.parse('inmemory://model/config.ts');

        // Get existing models or create new ones
        let dataModelInstance = monaco.editor.getModel(dataUri);
        if (!dataModelInstance) {
            dataModelInstance = monaco.editor.createModel(data, 'json', dataUri);
        } else {
            dataModelInstance.setValue(data);
        }

        let configModelInstance = monaco.editor.getModel(configUri);
        if (!configModelInstance) {
            configModelInstance = monaco.editor.createModel(config, 'typescript', configUri);
        } else {
            configModelInstance.setValue(config);
        }

        setDataModel(dataModelInstance);
        setConfigModel(configModelInstance);

        // Set active model
        editor.setModel(activeFile === 'data' ? dataModelInstance : configModelInstance);

        // Listen to content changes
        dataModelInstance.onDidChangeContent(() => {
            onDataChange(dataModelInstance.getValue());
        });

        configModelInstance.onDidChangeContent(() => {
            onConfigChange(configModelInstance.getValue());
        });
    };

    // Switch models when activeFile changes
    useEffect(() => {
        if (editorRef.current && dataModel && configModel) {
            const model = activeFile === 'data' ? dataModel : configModel;
            editorRef.current.setModel(model);
        }
    }, [activeFile, dataModel, configModel]);

    // Update model values when props change (e.g., from template load)
    useEffect(() => {
        if (dataModel && dataModel.getValue() !== data) {
            dataModel.setValue(data);
        }
    }, [data, dataModel]);

    useEffect(() => {
        if (configModel && configModel.getValue() !== config) {
            configModel.setValue(config);
        }
    }, [config, configModel]);

    // Cleanup models on unmount
    useEffect(() => {
        return () => {
            if (dataModel) {
                dataModel.dispose();
            }
            if (configModel) {
                configModel.dispose();
            }
        };
    }, [dataModel, configModel]);

    const handleTabChange = (value: string) => {
        onActiveFileChange(value as 'data' | 'config');
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            {/* Tabs for switching between files */}
            <TabList
                value={activeFile}
                onUpdate={handleTabChange}
                size="m"
                className="editor-tab-list"
            >
                <Tab value="data" icon={<JsonIcon />}>
                    data.json
                </Tab>
                <Tab value="config" icon={<TypeScriptIcon />}>
                    config.ts
                </Tab>
            </TabList>

            {/* Monaco Editor */}
            <div style={{flex: 1}}>
                <MonacoEditor
                    height="100%"
                    onMount={handleEditorMount}
                    theme={monacoTheme}
                    options={{
                        minimap: {enabled: false},
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                    }}
                />
            </div>
        </div>
    );
}
