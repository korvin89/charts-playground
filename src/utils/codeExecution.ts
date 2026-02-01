export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    line?: number;
    column?: number;
    stack?: string;
  };
}

/**
 * Safely executes user code and returns chart configuration
 */
export function executeCode(code: string): ExecutionResult {
  try {
    // Create a new Function to execute the code in isolated scope
    // Pass code as a string directly to Function constructor
    // eslint-disable-next-line no-new-func
    const fn = new Function('return (' + code + ')');

    const result = fn();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: parseError(error as Error),
    };
  }
}

/**
 * Parses error object to extract useful information
 */
function parseError(error: Error): ExecutionResult['error'] {
  const message = error.message;
  const stack = error.stack;

  // Try to extract line and column from error
  let line: number | undefined;
  let column: number | undefined;

  // Parse error stack to get line/column
  const stackMatch = stack?.match(/:(\d+):(\d+)/);
  if (stackMatch) {
    line = parseInt(stackMatch[1], 10);
    column = parseInt(stackMatch[2], 10);
  }

  return {
    message,
    line,
    column,
    stack,
  };
}
