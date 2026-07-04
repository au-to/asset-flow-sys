import { useState } from 'react';
import { Modal, Descriptions, Table, Tag, Typography } from 'antd';
import { Application, ApplicationItem } from '../../api';
import { APPLICATION_STATUS_LABELS, ASSET_CATEGORY_LABELS } from '@asset-flow/shared';

interface DetailModalProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  footer?: React.ReactNode;
}

export function ApplicationDetailModal({ open, application, onClose, footer }: DetailModalProps) {
  const itemColumns = [
    { title: '资产分类', dataIndex: 'category', render: (v: string) => ASSET_CATEGORY_LABELS[v as keyof typeof ASSET_CATEGORY_LABELS] },
    { title: '资产名称', dataIndex: 'assetName' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '资产Key', dataIndex: 'assetKey', render: (v: string | null) => v || '-' },
  ];

  return (
    <Modal title="申请单详情" open={open} onCancel={onClose} footer={footer} width={720}>
      {application && (
        <>
          <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="申请人">{application.applicant.username}</Descriptions.Item>
            <Descriptions.Item label="部门">{application.applicant.departmentName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag>{APPLICATION_STATUS_LABELS[application.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {new Date(application.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="申请原因" span={2}>
              {application.reason}
            </Descriptions.Item>
          </Descriptions>
          <Typography.Title level={5}>资产明细</Typography.Title>
          <Table<ApplicationItem>
            rowKey="id"
            dataSource={application.items}
            columns={itemColumns}
            pagination={false}
            size="small"
          />
        </>
      )}
    </Modal>
  );
}

export function useActionLoading() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const wrap = async (id: string, action: () => Promise<void>) => {
    setLoadingId(id);
    try {
      await action();
    } finally {
      setLoadingId(null);
    }
  };
  return { loadingId, wrap };
}
