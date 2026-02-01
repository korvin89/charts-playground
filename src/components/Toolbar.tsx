import { Button, Select, Text } from '@gravity-ui/uikit';
import { templates } from '../templates';

interface ToolbarProps {
  onRun: () => void;
  onTemplateSelect: (data: string, config: string) => void;
  onShare: () => void;
  isRunning?: boolean;
}

export function Toolbar({
  onRun,
  onTemplateSelect,
  onShare,
  isRunning = false,
}: ToolbarProps) {
  const templateOptions = templates.map((template) => ({
    value: template.id,
    content: template.name,
    title: template.description,
  }));

  const handleTemplateChange = (value: string[]) => {
    const template = templates.find((t) => t.id === value[0]);
    if (template) {
      onTemplateSelect(template.data, template.config);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--g-color-line-generic)',
      }}
    >
      <Text variant="subheader-1">Charts Sandbox</Text>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
        <Select
          placeholder="Load template..."
          options={templateOptions}
          onUpdate={handleTemplateChange}
          width="max"
          size="l"
        />

        <Button view="action" size="l" onClick={onRun} loading={isRunning}>
          Run
        </Button>

        <Button view="outlined" size="l" onClick={onShare}>
          Share
        </Button>
      </div>
    </div>
  );
}
