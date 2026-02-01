import { Button } from '@gravity-ui/uikit';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme } from '../store/slices/themeSlice';

export function ThemeSwitcher() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <Button view="flat" size="l" onClick={() => dispatch(toggleTheme())}>
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
