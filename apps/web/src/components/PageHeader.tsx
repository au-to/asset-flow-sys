import { Typography } from 'antd';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
        {title}
      </Typography.Title>
      {description && (
        <Typography.Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
          {description}
        </Typography.Text>
      )}
    </div>
  );
}
