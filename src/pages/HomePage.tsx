import { Button, Text, Icon } from '@gravity-ui/uikit';
import { ArrowUpRightFromSquare } from '@gravity-ui/icons';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px',
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '64px',
        }}
      >
        <Text variant="display-3" style={{ display: 'block', marginBottom: '16px' }}>
          Charts Playground
        </Text>
        <Text
          variant="body-2"
          color="secondary"
          style={{
            display: 'block',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px',
          }}
        >
          Interactive playground for @gravity-ui/charts library. Write
          JavaScript configuration objects and see live chart previews
          instantly.
        </Text>
        <div
          style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}
        >
          <Button view="action" size="xl" onClick={() => navigate('/editor')}>
            Open Editor
          </Button>
        </div>
      </div>

      {/* Documentation Links */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button
          view="outlined"
          size="xl"
          href="https://gravity-ui.github.io/charts/"
          target="_blank"
        >
          Documentation
          <Icon data={ArrowUpRightFromSquare} />
        </Button>
        <Button
          view="outlined"
          size="xl"
          href="https://github.com/gravity-ui/charts"
          target="_blank"
        >
          GitHub
          <Icon data={ArrowUpRightFromSquare} />
        </Button>
      </div>
    </div>
  );
}
