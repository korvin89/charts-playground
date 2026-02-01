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

// Отправляем сигнал готовности
console.log('[CONFIG_SANDBOX] Sending ready signal');
window.parent.postMessage({ type: 'CONFIG_SANDBOX_READY' }, '*');

// Слушаем сообщения от parent
window.addEventListener('message', (event: MessageEvent<ExecuteConfigMessage>) => {
  const { type, data, config } = event.data;

  if (type !== 'EXECUTE_CONFIG') return;

  console.log('[CONFIG_SANDBOX] Executing config code');

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
    // Код должен объявить переменную chartConfig с результатом
    const fn = new Function(
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
      `${jsCode}
      
      if (typeof chartConfig === 'undefined') {
        throw new Error('Config must declare a "chartConfig" variable with the chart configuration');
      }
      return chartConfig;`
    );

    // Выполняем с белым списком глобальных API
    const chartConfig = fn(
      getData,
      Math,
      Date,
      Array,
      Object,
      JSON,
      String,
      Number,
      Boolean,
      console
    );

    console.log('[CONFIG_SANDBOX] Config executed successfully:', chartConfig);

    // Отправляем результат обратно
    window.parent.postMessage(
      {
        type: 'CONFIG_SUCCESS',
        chartConfig,
      } as ConfigSuccessMessage,
      '*'
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
      '*'
    );
  }
});
