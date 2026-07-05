import { Typography } from 'antd';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
}

export default function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-main">
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
            {description}
          </Typography.Text>
        )}
      </div>
      {extra && <div className="page-header-extra">{extra}</div>}
    </div>
  );
}
