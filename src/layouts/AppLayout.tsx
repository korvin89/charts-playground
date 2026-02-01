import { useMemo, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
  Breadcrumbs,
  RadioGroup,
  Button,
  Label,
  Dialog,
  TextInput,
  Icon,
} from '@gravity-ui/uikit';
import { AsideHeader, Settings, FooterItem } from '@gravity-ui/navigation';
import { House, Code, Gear, Pencil } from '@gravity-ui/icons';
import '@gravity-ui/navigation/build/esm/components/AsideHeader/AsideHeader.css';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { executeCode, setCurrentSessionName } from '../store/slices/editorSlice';
import { setThemeMode, type ThemeMode } from '../store/slices/themeSlice';
import { generateShareUrl } from '../utils/urlState';
import { LogoIcon } from '../components/LogoIcon';
import { renameSession } from '../utils/sessionStorage';
import packageJson from '../../package.json';

export function AppLayout() {
  const theme = useAppSelector((state) => state.theme.theme);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { data, config, isRunning, currentSessionId, currentSessionName } =
    useAppSelector((state) => state.editor);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [compact, setCompact] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const isEditorPage = location.pathname.startsWith('/editor/') && currentSessionId;
  const isEditorHome = location.pathname === '/editor';

  const handleRun = () => {
    dispatch(executeCode());
  };

  const handleShare = () => {
    const shareUrl = generateShareUrl(data, config);
    navigator.clipboard.writeText(shareUrl);
    // TODO: Add toast notification
  };

  const handleOpenRename = () => {
    setNewName(currentSessionName || currentSessionId || '');
    setRenameOpen(true);
  };

  const handleRename = () => {
    if (currentSessionId && newName.trim()) {
      renameSession(currentSessionId, newName.trim());
      dispatch(setCurrentSessionName(newName.trim()));
    }
    setRenameOpen(false);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      dispatch(setThemeMode('system'));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, dispatch]);

  // Generate breadcrumbs based on current route
  const renderBreadcrumbs = () => {
    if (isEditorHome) {
      return (
        <Breadcrumbs className="breadcrumbs-flex">
          <Breadcrumbs.Item onClick={() => navigate('/')}>Home</Breadcrumbs.Item>
          <Breadcrumbs.Item>Editor</Breadcrumbs.Item>
        </Breadcrumbs>
      );
    } else if (isEditorPage) {
      const displayName = currentSessionName || currentSessionId;
      return (
        <Breadcrumbs
          className="breadcrumbs-flex"
          endContent={
            <Button view="flat" size="s" onClick={handleOpenRename}>
              <Icon data={Pencil} size={14} />
            </Button>
          }
        >
          <Breadcrumbs.Item onClick={() => navigate('/')}>Home</Breadcrumbs.Item>
          <Breadcrumbs.Item onClick={() => navigate('/editor')}>Editor</Breadcrumbs.Item>
          <Breadcrumbs.Item>{displayName}</Breadcrumbs.Item>
        </Breadcrumbs>
      );
    }
    return null;
  };

  const handleItemClick = (_id: string, path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const chartsVersion = packageJson.dependencies['@gravity-ui/charts'].replace('^', '');

  const menuItems = useMemo(
    () => [
      {
        id: 'home',
        title: 'Home',
        icon: House,
        current: location.pathname === '/',
        onItemClick: () => handleItemClick('home', '/'),
      },
      {
        id: 'editor',
        title: 'Editor',
        icon: Code,
        current: location.pathname.startsWith('/editor'),
        onItemClick: () => handleItemClick('editor', '/editor'),
        rightAdornment: <Label size="xs" theme="info">v{chartsVersion}</Label>,
      },
    ],
    [location.pathname, chartsVersion]
  );

  const panelItems = useMemo(
    () => [
      {
        id: 'settings',
        open: settingsOpen,
        children: (
          <Settings onClose={() => setSettingsOpen(false)}>
            <Settings.Page id="appearance" title="Appearance" icon={{ data: Gear }}>
              <Settings.Section title="Theme">
                <Settings.Item title="Color scheme">
                  <RadioGroup
                    value={themeMode}
                    onUpdate={(value) => dispatch(setThemeMode(value as ThemeMode))}
                  >
                    <RadioGroup.Option value="system">System</RadioGroup.Option>
                    <RadioGroup.Option value="light">Light</RadioGroup.Option>
                    <RadioGroup.Option value="dark">Dark</RadioGroup.Option>
                  </RadioGroup>
                </Settings.Item>
              </Settings.Section>
            </Settings.Page>
          </Settings>
        ),
        size: 834,
        maxSize: 834,
      },
    ],
    [settingsOpen, themeMode, dispatch]
  );

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{
          icon: LogoIcon,
          text: 'Charts Playground',
        }}
        menuItems={menuItems}
        panelItems={panelItems}
        onClosePanel={() => setSettingsOpen(false)}
        compact={compact}
        onChangeCompact={setCompact}
        renderFooter={({ compact }) => (
          <FooterItem
            id="settings"
            icon={Gear}
            title="Settings"
            compact={compact}
            onItemClick={() => setSettingsOpen(true)}
          />
        )}
        renderContent={() => (
          <div
            style={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top bar with breadcrumbs */}
            {location.pathname !== '/' && (
              <header
                style={{
                  height: '58px',
                  minHeight: '58px',
                  borderBottom: '1px solid var(--g-color-line-generic)',
                  padding: '0 20px',
                  backgroundColor: 'var(--g-color-base-background)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {renderBreadcrumbs()}

                {/* Editor page actions */}
                {isEditorPage && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <Button view="action" size="l" onClick={handleRun} loading={isRunning}>
                      Run
                    </Button>
                    <Button view="outlined" size="l" onClick={handleShare}>
                      Share
                    </Button>
                  </div>
                )}
              </header>
            )}

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
              <Dialog.Header caption="Rename Session" />
              <Dialog.Body>
                <TextInput
                  value={newName}
                  onUpdate={setNewName}
                  placeholder="Enter session name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename();
                    }
                  }}
                />
              </Dialog.Body>
              <Dialog.Footer
                onClickButtonCancel={() => setRenameOpen(false)}
                onClickButtonApply={handleRename}
                textButtonApply="Rename"
                textButtonCancel="Cancel"
              />
            </Dialog>

            {/* Page content */}
            <main
              style={{
                flex: 1,
                overflow: isEditorPage ? 'hidden' : 'auto',
                backgroundColor: 'var(--g-color-base-background)',
                color: 'var(--g-color-text-primary)',
              }}
            >
              <Outlet />
            </main>
          </div>
        )}
      />
    </ThemeProvider>
  );
}
