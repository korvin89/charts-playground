# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive sandbox for [@gravity-ui/charts](https://github.com/gravity-ui/charts) library. Users work with **two separate editors** (data.json and config.ts) in Monaco Editor with tabs, execute them through **two isolated sandboxes**, and see live chart previews. **Sessions are persisted in localStorage** and can be shared via URL with LZ-string compression.

**Key Architecture:**
- **Data Editor (data.json)**: JSON data for charts
- **Config Editor (config.ts)**: TypeScript/JavaScript code that processes data and generates chart configuration
- **Config Sandbox**: Isolated iframe that executes config code with **limited API access** (only Math, Date, Array, Object, JSON)
- **Chart Sandbox**: Isolated iframe that renders the final chart using @gravity-ui/charts
- **Session System**: Each sandbox session has a unique 8-char ID and is auto-saved to localStorage

## Development Commands

```bash
npm run dev      # Start dev server on http://localhost:5173
npm run build    # TypeScript compile + Vite build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

**Note:** No test runner is configured. The project has one test file ([src/App.test.tsx](src/App.test.tsx)) but no test script in package.json.

## Architecture

### Multi-Page Application

The app uses **React Router (BrowserRouter)** with the following routes:
- **Home (/)**: Landing page with hero section and quick examples
- **Sandbox Home (/sandbox)**: Session list, templates, and "How it works" documentation
- **Sandbox Editor (/sandbox/:sessionId)**: Code editor + chart preview for a specific session
- **Share Redirect (/sandbox/share)**: Handles share URLs by creating a new session and redirecting

### State Management - Redux Toolkit

All application state is managed via Redux store:
- **editorSlice**: Data content, config content, active file (tab), execution counter, running state, current session ID/name
- **themeSlice**: Theme mode (system/light/dark) and computed theme value

Key files:
- [src/store/index.ts](src/store/index.ts): Store configuration
- [src/store/hooks.ts](src/store/hooks.ts): Typed hooks (useAppDispatch, useAppSelector)
- [src/store/slices/editorSlice.ts](src/store/slices/editorSlice.ts): Editor state with `data`, `config`, `activeFile`, `currentSessionId`, `currentSessionName` fields
- [src/store/slices/themeSlice.ts](src/store/slices/themeSlice.ts): Theme state with system theme detection

### Session System (localStorage)

Sessions are stored in localStorage under key `charts-sandbox-sessions` as JSON array.

**Session Model** ([src/types/session.ts](src/types/session.ts)):
```typescript
interface SandboxSession {
  id: string;           // 8-char alphanumeric ID
  name?: string;        // Optional custom name
  data: string;         // JSON data
  config: string;       // TS/JS config
  createdAt: number;    // Timestamp
  updatedAt: number;    // Timestamp
  sourceTemplate?: string; // Template ID if created from template
}
```

**Session Utilities** ([src/utils/sessionStorage.ts](src/utils/sessionStorage.ts)):
- `generateSessionId()`: Creates 8-char alphanumeric ID
- `getAllSessions()`: Get all sessions sorted by updatedAt
- `getSession(id)`: Get single session
- `saveSession(session)`: Create or update session
- `deleteSession(id)`: Remove session
- `renameSession(id, name)`: Update session name
- `updateSessionContent(id, data, config)`: Update data/config (used for auto-save)
- `createSessionFromTemplate(templateId)`: Create session from template
- `createSessionFromUrl()`: Create session from share URL params
- `createEmptySession()`: Create blank session

**Auto-save**: `SandboxEditorPage` automatically saves to localStorage on every data/config change.

### Navigation - @gravity-ui/navigation

Uses **AsideHeader** component from @gravity-ui/navigation for sidebar navigation:
- Logo with custom LogoIcon component
- Menu items: Home, Sandbox (with version badge via `rightAdornment`)
- Footer settings button that opens Settings panel
- **Important**: AsideHeader wraps all content via `renderContent` prop

Key pattern:
```typescript
<AsideHeader
  logo={{...}}
  menuItems={...}
  panelItems={...}  // Settings panel
  renderFooter={...}  // Settings button
  renderContent={({ size }) => (
    <div>
      <header>{/* Breadcrumbs + actions */}</header>
      <main><Outlet /></main>
    </div>
  )}
/>
```

### Layout Structure

```
AppLayout.tsx (AsideHeader wrapper)
├── Sidebar navigation (menuItems prop with version badge on Sandbox)
├── Settings panel (panelItems prop)
└── renderContent:
    ├── Header (58px) - Breadcrumbs + actions (Run/Share on editor page, rename button)
    └── Main content (flex: 1) - React Router Outlet
        ├── HomePage
        ├── SandboxHomePage (sessions list + templates + documentation accordion)
        ├── SandboxEditorPage (Allotment with Editor + SandboxPreview)
        └── ShareRedirect (handles share URLs)
```

### Core Flow (Two-Sandbox Architecture)

1. User edits **data.json** (JSON data) and **config.ts** (TypeScript config code) in Monaco Editor with tabs
2. Clicks "Run" button in header → Redux action dispatched, executeCounter incremented
3. **Step 1 - Config Execution:**
   - Data + config sent to **config-sandbox** iframe via postMessage
   - Config sandbox executes TypeScript code with **restricted API** (only Math, Date, Array, Object, JSON, String, Number, Boolean, console)
   - Config code has access to `getData()` function to retrieve parsed JSON data and **must declare a `chartConfig` variable** with the chart configuration
   - Result (chartConfig) sent back to parent
4. **Step 2 - Chart Rendering:**
   - Parent sends chartConfig to **chart-sandbox** iframe
   - Chart sandbox renders Chart component using @gravity-ui/charts
   - Success/error messages sent back to parent
5. Errors from either sandbox display as overlay with full stack trace and source indicator (config/chart)

### Sandbox Architecture (Two-Sandbox Isolated Execution)

**Why Two Sandboxes?** Separation of concerns and security:
1. **Config sandbox**: Executes user TypeScript code with **restricted API** to generate chart config
2. **Chart sandbox**: Renders chart with full React/UIKit environment

This architecture prevents user code from accessing browser APIs while allowing chart library to work normally.

#### Config Sandbox (TS/JS Execution)

**Key Files:**
- **[config-sandbox-iframe.html](config-sandbox-iframe.html)**: Entry point for config sandbox iframe
- **[src/config-sandbox.tsx](src/config-sandbox.tsx)**: Executes user config code with limited API access

**API Restrictions:**
- ✅ **Allowed**: `Math`, `Date`, `Array`, `Object`, `JSON`, `String`, `Number`, `Boolean`, `console`
- ✅ **Allowed**: Array methods (map, filter, reduce, etc.)
- ❌ **Blocked**: `window` (except white-listed), `document`, `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `sessionStorage`, `indexedDB`, `setTimeout`, `setInterval`

**Communication:**
1. Parent → Config Sandbox: `{ type: 'EXECUTE_CONFIG', data, config }`
2. Config sandbox parses JSON `data`, executes config code via `new Function()` with white-listed globals
3. Config sandbox → Parent: `{ type: 'CONFIG_SUCCESS', chartConfig }` or `{ type: 'CONFIG_ERROR', error }`

**Config Format:**
Config code has access to `getData()` function and must declare a `chartConfig` variable with the chart configuration. This allows writing full TypeScript with intermediate variables:
```typescript
// Example config code - user can name their variable anything
const data = getData();
const processedData = data.map(d => ({ ...d, y: d.y * 2 }));

const chartConfig = {
  series: {
    data: [{ type: 'line', data: processedData, name: 'Processed' }]
  }
};

// Or with destructuring
const { series1, series2 } = getData();
```

**Security Implementation:**
```typescript
const getData = () => parsedData;
const fn = new Function(
  'getData', 'Math', 'Date', 'Array', 'Object', 'JSON', // ... only allowed APIs
  `${config}
   if (typeof chartConfig === 'undefined') {
     throw new Error('Config must declare a "chartConfig" variable');
   }
   return chartConfig;`
);
const chartConfig = fn(getData, Math, Date, Array, Object, JSON);
```

#### Chart Sandbox (Chart Rendering)

**Key Files:**
- **[chart-sandbox-iframe.html](chart-sandbox-iframe.html)**: Entry point for chart sandbox iframe (renamed from sandbox-iframe.html)
- **[src/chart-sandbox.tsx](src/chart-sandbox.tsx)**: Renders Chart component using @gravity-ui/charts (renamed from sandbox.tsx)

**CRITICAL FILE NAMING:** Chart sandbox HTML file is named `chart-sandbox-iframe.html` (NOT `sandbox.html`) to avoid conflict with React Router's `/sandbox` route.

**Communication:**
1. Parent → Chart Sandbox: `{ type: 'EXECUTE_CHART', chartConfig, theme }` (chartConfig is pre-computed by config sandbox)
2. Chart sandbox renders Chart component with React + ErrorBoundary
3. Chart sandbox → Parent: `{ type: 'CHART_SUCCESS' }` or `{ type: 'CHART_ERROR', error }`

**Error Handling:**
- **Config sandbox errors**: JSON parsing errors, syntax errors in config code, runtime errors (no access to DOM/fetch)
- **Chart sandbox errors**: Chart validation errors, rendering errors
- Both error types sent to parent with message, stack trace, line/column info, and **error source** ('config' or 'chart')
- ErrorBoundary resets on each render via `key={renderCounter}`

#### SandboxPreview (Orchestrator)

**[src/components/SandboxPreview.tsx](src/components/SandboxPreview.tsx)**: Manages both iframes and orchestrates the two-step execution flow.

**State:**
- `configSandboxReady` / `chartSandboxReady`: Track when iframes are ready
- `error` + `errorSource`: Current error with source indicator ('config' | 'chart')

**Flow:**
1. Wait for both sandboxes to send READY signals
2. On Run click: send data+config to config-sandbox
3. On CONFIG_SUCCESS: send chartConfig to chart-sandbox
4. On CONFIG_ERROR or CHART_ERROR: display error overlay with source
5. Both iframes stay mounted even during errors to maintain ready state

**Important:** Code execution happens ONLY when Run button is clicked (tracked via `executeCounter` in Redux), not on every code edit.

### Key Components

**Layout & Navigation:**
- **[src/layouts/AppLayout.tsx](src/layouts/AppLayout.tsx)**: Main layout wrapper with AsideHeader navigation, breadcrumbs (with session name and rename button), settings panel, and Run/Share buttons for editor page
- **[src/routes/index.tsx](src/routes/index.tsx)**: React Router configuration with BrowserRouter

**Pages:**
- **[src/pages/HomePage.tsx](src/pages/HomePage.tsx)**: Landing page with hero section and quick examples
- **[src/pages/SandboxHomePage.tsx](src/pages/SandboxHomePage.tsx)**: Sandbox landing with:
  - Hero section with description
  - Accordion with "How it works" documentation
  - Recent sessions list (from localStorage)
  - Template cards grid with "Empty Sandbox" button
- **[src/pages/SandboxEditorPage.tsx](src/pages/SandboxEditorPage.tsx)**: Code editor + preview with:
  - Session loading from URL params (`:sessionId`)
  - Auto-save to localStorage on every change
  - Redirect to `/sandbox` if session not found
- **[src/pages/ShareRedirect.tsx](src/pages/ShareRedirect.tsx)**: Handles share URLs by creating new session and redirecting

**Session Components:**
- **[src/components/SessionList.tsx](src/components/SessionList.tsx)**: Grid of session cards
- **[src/components/SessionCard.tsx](src/components/SessionCard.tsx)**: Card with session info, chart type labels, rename/delete actions via DropdownMenu

**Editor & Preview:**
- **[src/components/Editor.tsx](src/components/Editor.tsx)**: Monaco Editor with **multi-model support** and tabs for data.json and config.ts. Uses `monaco.editor.createModel()` for each file with proper cleanup on unmount. **TypeScript autocompletion** is enabled for config.ts with `ChartData` types from @gravity-ui/charts.
- **[src/components/SandboxPreview.tsx](src/components/SandboxPreview.tsx)**: Manages **two iframes** (config-sandbox and chart-sandbox) with **absolute paths** (`/config-sandbox-iframe.html`, `/chart-sandbox-iframe.html`) and orchestrates execution flow. Shows error overlays with source indicator. Both iframes stay mounted to maintain ready state.

**Type Definitions:**
- **[src/utils/chartTypes.ts](src/utils/chartTypes.ts)**: Simplified TypeScript type definitions for Monaco Editor autocompletion. Contains `ChartData`, all series types, axis types, and `getData()` function declaration.

**Other:**
- **[src/components/LogoIcon.tsx](src/components/LogoIcon.tsx)**: Custom SVG logo for navigation header

### Utilities

- **[src/utils/urlState.ts](src/utils/urlState.ts)**: LZ-string compression for URL state. Functions: `generateShareUrl(data, config)`, `loadStateFromUrl()` → `{data, config}`, `compressCode()`, `decompressCode()`. Share URLs use `/sandbox/share?data=<compressed>&config=<compressed>`
- **[src/utils/sessionStorage.ts](src/utils/sessionStorage.ts)**: CRUD operations for localStorage sessions (see Session System section above)
- **[src/utils/chartAnalyzer.ts](src/utils/chartAnalyzer.ts)**: Extracts series types from config code using regex. Functions: `extractSeriesTypes(config)`, `formatSeriesTypes(types)`, `getChartTypeLabels(config)`. Used to display chart type labels on session cards (e.g., "line", "2 bar-y", "pie").
- **[src/templates/index.ts](src/templates/index.ts)**: Predefined examples with **separate data and config fields**. Each template has `data: string` (JSON) and `config: string` (TS/JS code). Templates: line-basic, bar-basic, pie-basic, multi-series, with-formatter.

### Breadcrumbs Navigation

- Uses @gravity-ui/uikit Breadcrumbs with compound pattern (Breadcrumbs.Item)
- Sandbox home: Home / Sandbox
- Sandbox editor: Home / Sandbox / [Session Name] + rename button (pencil icon) in `endContent`
- Breadcrumbs have `.breadcrumbs-flex` class for `flex-grow: 1` styling
- Version badge moved to sidebar menu item "Sandbox" via `rightAdornment` prop

### Sandbox Page Layout

- Uses [Allotment](https://github.com/johnwalley/allotment) for resizable split panels
- **Left pane**: Monaco Editor with **tabs for data.json and config.ts**
  - data.json: JSON syntax highlighting
  - config.ts: TypeScript syntax highlighting
  - Tabs styled to match IDE experience (data.json / config.ts)
  - Models created with `monaco.editor.createModel()` and proper cleanup with `.dispose()` on unmount
- **Right pane**: Chart preview or error display (with error source: 'config' or 'chart')
- Header (58px): Breadcrumbs on left, Run + Share buttons on right
- Run and Share buttons are in AppLayout header, not in SandboxPage component

### Theme System

Theme state is managed via Redux with three modes:
- **system**: Auto-detects OS theme via `matchMedia('prefers-color-scheme: dark')`
- **light**: Force light theme
- **dark**: Force dark theme

Theme mode is selected via Settings panel (gear icon in footer) with RadioGroup component.

Implementation:
- Redux store (themeSlice) has `mode: ThemeMode` and computed `theme: ThemeValue`
- `@gravity-ui/uikit` ThemeProvider wraps entire app in AppLayout
- Monaco Editor receives theme as `'vs-light'` or `'vs-dark'`
- CSS variables from UIKit (`--g-color-*`) used throughout
- System theme changes are detected via `matchMedia` event listener in AppLayout

### Code Execution Security

Code executes in an **isolated iframe sandbox** with `sandbox="allow-scripts allow-same-origin"` attributes:
- iframe prevents access to parent window state/DOM
- `allow-scripts` enables JavaScript execution
- `allow-same-origin` required for postMessage communication
- Code runs via `Function()` constructor inside sandbox
- Chart component renders in React with full isolation from main app

This dual-layer isolation (iframe + Function constructor) ensures user code cannot affect main application.

## Routing Configuration

- Uses **BrowserRouter** (not HashRouter) for clean URLs without hashes
- Base path: `/` (root deployment)
- Routes:
  - `/` - HomePage
  - `/sandbox` - SandboxHomePage (session list + templates)
  - `/sandbox/share` - ShareRedirect (handles `?data=...&config=...` params)
  - `/sandbox/:sessionId` - SandboxEditorPage
  - `*` - 404 redirect to Home
- Vite dev server automatically handles SPA fallback for direct route access

**GitHub Pages SPA Support:**
- [404.html](404.html): Redirect script that encodes the path into query string when GitHub Pages returns 404
- [index.html](index.html): Script that decodes query string and restores original URL using `history.replaceState`
- This allows direct access to any route (e.g., `/sandbox`) to work correctly on GitHub Pages

## GitHub Pages Deployment

- **Important**: [vite.config.ts](vite.config.ts) has `base: '/'` for root path deployment
- GitHub Actions workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) auto-deploys on push to main
- Workflow: `npm ci` → `npm run build` → upload dist/ to GitHub Pages
- **Multi-entry build**: vite.config.ts configured with **three** entry points:
  - `main: resolve(__dirname, 'index.html')` - Main React app
  - `'chart-sandbox': resolve(__dirname, 'chart-sandbox-iframe.html')` - Chart rendering iframe
  - `'config-sandbox': resolve(__dirname, 'config-sandbox-iframe.html')` - Config execution iframe

When deploying to a different repo, update the `base` path in vite.config.ts.

## State Management

**Redux Store (Global):**
- `editor.data`: Current data.json content (JSON string)
- `editor.config`: Current config.ts content (TypeScript/JavaScript string)
- `editor.activeFile`: Active tab in Monaco Editor ('data' | 'config')
- `editor.executeCounter`: Increments on each Run click, triggers execution in SandboxPreview
- `editor.isRunning`: Loading state for Run button
- `editor.currentSessionId`: Currently open session ID (null on home page)
- `editor.currentSessionName`: Currently open session name (for display in breadcrumbs)
- `theme.mode`: Theme mode ('system' | 'light' | 'dark')
- `theme.theme`: Computed theme value ('light' | 'dark')

**localStorage:**
- `charts-sandbox-sessions`: JSON array of `SandboxSession` objects (see Session System section)

**Component-Local State:**
- **Editor.tsx**:
  - `dataModel`: Monaco model for data.json
  - `configModel`: Monaco model for config.ts
  - Models created with proper URIs and disposed on unmount to prevent "model already exists" errors
- **SandboxPreview.tsx**:
  - `configSandboxReady` / `chartSandboxReady`: Whether each iframe has loaded and sent READY signal
  - `error`: Current error from either sandbox (null if no error)
  - `errorSource`: Which sandbox produced the error ('config' | 'chart' | null)
  - `hasExecuted`: Whether Run has been clicked at least once
  - `dataRef` / `configRef`: Refs storing current data/config to prevent re-execution on edit
- **SandboxEditorPage.tsx**:
  - `isLoadingRef`: Prevents auto-save during initial session load
  - `loadedSessionIdRef`: Tracks which session is loaded to prevent stale saves
- **SandboxHomePage.tsx**:
  - `updateKey`: Increments to force re-render after session delete/rename
- **AppLayout.tsx**:
  - `compact`: Sidebar compact mode
  - `settingsOpen`: Whether settings panel is open
  - `renameOpen` / `newName`: Rename dialog state

**URL State:**
- Share URL format: `/sandbox/share?data=<compressed>&config=<compressed>`
- Both data and config compressed with LZ-string
- Opening share URL creates new session and redirects to `/sandbox/:newId`

## Error Handling (Two-Sandbox Architecture)

Errors can come from two sources and are displayed with red overlay indicating the source:

### Config Sandbox Errors
1. **JSON parsing errors**: Invalid JSON in data.json
2. **Syntax errors**: Invalid JavaScript/TypeScript in config.ts
3. **Runtime errors**: Errors during config code execution (e.g., accessing blocked APIs like `window`, `fetch`)
4. **Type errors**: Trying to use undefined variables or methods

### Chart Sandbox Errors
1. **Chart validation errors**: Invalid chart configuration (e.g., "inappropriate data type for 'y' value")
2. **Render errors**: Errors during Chart component rendering

### Error Display
Errors are sent to parent via postMessage with:
- `message`: Error message
- `stack`: Full stack trace
- `line`/`column`: Parsed from stack (when available)
- **Error source indicator**: Header shows "Config Execution Error" or "Chart Render Error"

**Critical:** Both iframes stay mounted even when showing errors. This maintains `isReady` state so subsequent Run clicks work immediately.

## Tech Stack

- React 19 + TypeScript
- Vite 7 for build/dev
- **React Router 7** (BrowserRouter for routing)
- **Redux Toolkit** (state management)
- **@gravity-ui/uikit** (UI components: Button, Label, Breadcrumbs, ThemeProvider, RadioGroup, etc.)
- **@gravity-ui/navigation** (AsideHeader, Settings, FooterItem)
- **@gravity-ui/icons** (House, Box, Code, Gear icons)
- @gravity-ui/charts (chart rendering library)
- Monaco Editor via @monaco-editor/react
- Allotment (resizable panels)
- lz-string (URL compression)

## Important Technical Notes

### AsideHeader Pattern
The entire application must be rendered inside AsideHeader's `renderContent` prop. Do NOT create a separate Sidebar component - AsideHeader handles all navigation internally.

```typescript
// CORRECT
<AsideHeader
  menuItems={...}
  renderContent={() => <div>Your app content</div>}
/>

// WRONG - Don't create separate Sidebar
<Sidebar />
<MainContent />
```

### Settings Panel Configuration
Settings panel uses `panelItems` array with specific structure:
```typescript
panelItems={[{
  id: 'settings',
  open: settingsOpen,  // NOT 'visible'
  children: <Settings>...</Settings>,  // NOT 'content'
  size: 834,
  maxSize: 834,
}]}
```

### Breadcrumbs Pattern
Use compound pattern with Breadcrumbs.Item components, not items array:
```typescript
// CORRECT
<Breadcrumbs>
  <Breadcrumbs.Item onClick={...}>Home</Breadcrumbs.Item>
  <Breadcrumbs.Item>Sandbox</Breadcrumbs.Item>
</Breadcrumbs>

// WRONG - Don't use items prop
<Breadcrumbs items={[{text: 'Home'}, ...]} />
```

### File Naming Conflict
Never rename `sandbox-iframe.html` back to `sandbox.html` - this will break routing. The React Router `/sandbox` route conflicts with a file named `sandbox.html`, causing Vite dev server to serve the iframe HTML instead of the main app.

### Iframe Paths Must Be Absolute
In `SandboxPreview.tsx`, iframe `src` attributes must use **absolute paths** (`/config-sandbox-iframe.html`, `/chart-sandbox-iframe.html`), NOT relative paths (`./...`). Relative paths break when on nested routes like `/sandbox/abc123` because they resolve relative to the current URL path.

### Accordion Component Pattern
Use compound pattern with `Accordion.Item`:
```typescript
<Accordion size="l">
  <Accordion.Item value="section-id" summary="Section Title">
    {/* Content here */}
  </Accordion.Item>
</Accordion>
```

### CSS Import for Navigation
Import navigation CSS explicitly:
```typescript
import '@gravity-ui/navigation/build/esm/components/AsideHeader/AsideHeader.css';
```

The path `@gravity-ui/navigation/styles/styles.css` does NOT exist.
