// Config Sandbox - выполняет TypeScript/JavaScript код с ограниченным API

interface ExecuteConfigMessage {
    type: 'EXECUTE_CONFIG';
    data: string;
    config: string;
}

interface ConfigSuccessMessage {
    type: 'CONFIG_SUCCESS';
    chartConfig: any;
}

interface ConfigErrorMessage {
    type: 'CONFIG_ERROR';
    error: {
        message: string;
        stack?: string;
        line?: number;
        column?: number;
    };
}

/**
 * Strips TypeScript type annotations from code to make it valid JavaScript.
 * This allows users to write `const chartConfig: ChartData = {...}` in the editor
 * while still being able to execute it as JavaScript.
 */
function stripTypeAnnotations(code: string): string {
    // Remove type annotations from variable declarations: `const x: Type =` -> `const x =`
    // Handles: const/let/var name: Type =
    let result = code.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[\w<>[\],\s|&]+\s*=/g, '$1 $2 =');

    // Remove type annotations from function parameters: `(x: Type)` -> `(x)`
    // Simple version - handles basic cases
    result = result.replace(/\(([^)]*)\)/g, (_match, params) => {
        const cleanedParams = params
            .split(',')
            .map((param: string) => param.replace(/:\s*[\w<>[\],\s|&?]+(?=\s*[,)=]|$)/, '').trim())
            .join(', ');
        return `(${cleanedParams})`;
    });

    // Remove type assertions: `as Type` at the end of expressions
    result = result.replace(/\s+as\s+[\w<>[\],\s|&]+(?=\s*[;,)\]}]|$)/g, '');
    // Remove generic type parameters from function calls: `getData<Type>()` -> `getData()`
    result = result.replace(/(\w+)<[\w<>[\],\s|&]+>\(/g, '$1(');

    return result;
}

window.parent.postMessage({type: 'CONFIG_SANDBOX_READY'}, '*');

window.addEventListener('message', (event: MessageEvent<ExecuteConfigMessage>) => {
    const {type, data, config} = event.data;

    if (type !== 'EXECUTE_CONFIG') return;

    try {
        // Парсим JSON data
        let parsedData: any;
        try {
            parsedData = JSON.parse(data);
        } catch (parseError: any) {
            throw new Error(`Invalid JSON in data: ${parseError.message}`);
        }

        // Создаем функцию getData, которая возвращает распарсенные данные
        const getData = () => parsedData;

        // Strip TypeScript type annotations to make code executable as JavaScript
        const jsCode = stripTypeAnnotations(config);

        // Создаем функцию с ограниченным контекстом
        // Передаем только разрешенные API как параметры
        // Блокируем опасные глобальные объекты, передавая undefined для их затенения
        // Код должен объявить переменную chartConfig с результатом

        // Белый список разрешенных API
        const allowedParams = [
            'getData',
            'Math',
            'Date',
            'Array',
            'Object',
            'JSON',
            'String',
            'Number',
            'Boolean',
            'console',
            'Intl',
        ];

        const blockedGlobals = [
            'window',
            'self',
            'globalThis',
            'document',
            'fetch',
            'XMLHttpRequest',
            'WebSocket',
            'EventSource',
            'localStorage',
            'sessionStorage',
            'indexedDB',
            'setTimeout',
            'setInterval',
            'clearTimeout',
            'clearInterval',
            'setImmediate',
            'clearImmediate',
            'requestAnimationFrame',
            'cancelAnimationFrame',
            'requestIdleCallback',
            'cancelIdleCallback',
            'Function',
            'importScripts',
            'Worker',
            'SharedWorker',
            'ServiceWorker',
            'navigator',
            'location',
            'history',
            'alert',
            'confirm',
            'prompt',
            'open',
            'close',
            'postMessage',
            'parent',
            'top',
            'frames',
            'opener',
            'crypto',
            'Notification',
            'BroadcastChannel',
            'MessageChannel',
            'MessagePort',
            'queueMicrotask',
            'Blob',
            'File',
            'FileReader',
            'URL',
            'URLSearchParams',
            'FormData',
            'Headers',
            'Request',
            'Response',
            'AbortController',
            'AbortSignal',
            'TextEncoder',
            'TextDecoder',
            'atob',
            'btoa',
            'Image',
            'Audio',
            'Video',
            'MediaSource',
            'SourceBuffer',
            'WebGL2RenderingContext',
            'WebGLRenderingContext',
            'OffscreenCanvas',
            'createImageBitmap',
            'performance',
        ];

        const allParams = [...allowedParams, ...blockedGlobals];

        const fn = new Function(
            ...allParams,
            `"use strict";
${jsCode}
      
if (typeof chartConfig === 'undefined') {
  throw new Error('Config must declare a "chartConfig" variable with the chart configuration');
}
return chartConfig;`,
        );

        const allowedValues = [
            getData,
            Math,
            Date,
            Array,
            Object,
            JSON,
            String,
            Number,
            Boolean,
            console,
        ];

        const blockedValues = blockedGlobals.map(() => undefined);
        const chartConfig = fn(...allowedValues, ...blockedValues);

        // Отправляем результат обратно
        window.parent.postMessage(
            {
                type: 'CONFIG_SUCCESS',
                chartConfig,
            } as ConfigSuccessMessage,
            '*',
        );
    } catch (error) {
        console.error('[CONFIG_SANDBOX] Config execution error:', error);

        const err = error as Error;
        const errorData = {
            message: err.message,
            stack: err.stack,
            line: undefined as number | undefined,
            column: undefined as number | undefined,
        };

        // Извлекаем строку и колонку из stack trace
        const stackMatch = err.stack?.match(/:(\d+):(\d+)/);
        if (stackMatch) {
            errorData.line = parseInt(stackMatch[1], 10);
            errorData.column = parseInt(stackMatch[2], 10);
        }

        window.parent.postMessage(
            {
                type: 'CONFIG_ERROR',
                error: errorData,
            } as ConfigErrorMessage,
            '*',
        );
    }
});
