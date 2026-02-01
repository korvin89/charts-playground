import LZString from 'lz-string';

const DATA_PARAM = 'data';
const CONFIG_PARAM = 'config';

/**
 * Compresses and encodes code to be URL-safe
 */
export function compressCode(code: string): string {
  return LZString.compressToEncodedURIComponent(code);
}

/**
 * Decompresses code from URL parameter
 */
export function decompressCode(compressed: string): string | null {
  try {
    return LZString.decompressFromEncodedURIComponent(compressed);
  } catch (error) {
    console.error('Failed to decompress code:', error);
    return null;
  }
}

/**
 * Loads state (data and config) from URL
 */
export function loadStateFromUrl(): { data: string | null; config: string | null } {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get(DATA_PARAM);
  const configParam = params.get(CONFIG_PARAM);

  return {
    data: dataParam ? decompressCode(dataParam) : null,
    config: configParam ? decompressCode(configParam) : null,
  };
}

/**
 * Generates shareable URL with current data and config
 */
export function generateShareUrl(data: string, config: string): string {
  const compressedData = compressCode(data);
  const compressedConfig = compressCode(config);
  const url = new URL(window.location.origin);

  // Use /editor/share route which will create a new session and redirect
  url.pathname = '/editor/share';
  url.searchParams.set(DATA_PARAM, compressedData);
  url.searchParams.set(CONFIG_PARAM, compressedConfig);

  return url.toString();
}
