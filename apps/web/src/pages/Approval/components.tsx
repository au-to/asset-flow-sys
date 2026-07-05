import { useState } from 'react';
import { Modal, Table, Typography, Button } from 'antd';
import { Application, ApplicationItem } from '../../api';
import { ApplicationStatus, ASSET_CATEGORY_LABELS } from '@asset-flow/shared';
import StatusBadge from '../../components/StatusBadge';

interface DetailModalProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  footer?: React.ReactNode;
}

interface BasicInfoRow {
  key: string;
  applicant: string;
  department: string;
  status: ApplicationStatus;
  createdAt: string;
  reason: string;
}

export function ApplicationDetailModal({ open, application, onClose, footer }: DetailModalProps) {
  const basicInfoColumns = [
    { title: '申请人', dataIndex: 'applicant', width: '12%', ellipsis: true },
    { title: '部门', dataIndex: 'department', width: '14%', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: '12%',
      align: 'center' as const,
      render: (status: ApplicationStatus) => <StatusBadge status={status} />,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      width: '22%',
      className: 'detail-modal-datetime',
    },
    { title: '申请原因', dataIndex: 'reason', ellipsis: true },
  ];

  const itemColumns = [
    {
      title: '资产分类',
      dataIndex: 'category',
      width: '26%',
      ellipsis: true,
      render: (v: string) => ASSET_CATEGORY_LABELS[v as keyof typeof ASSET_CATEGORY_LABELS],
    },
    { title: '资产名称', dataIndex: 'assetName', width: '26%', ellipsis: true },
    { title: '数量', dataIndex: 'quantity', width: '10%', align: 'center' as const },
    {
      title: '资产 Key',
      dataIndex: 'assetKey',
      ellipsis: true,
      render: (v: string | null) => (
        <Typography.Text code={!!v} ellipsis={!!v}>
          {v || '-'}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Modal
      title="申请单详情"
      open={open}
      onCancel={onClose}
      footer={
        footer ?? (
          <Button type="primary" onClick={onClose}>
            关闭
          </Button>
        )
      }
      width={760}
      destroyOnClose
      className="detail-modal"
    >
      {application && (
        <>
          <Typography.Title level={5} className="detail-modal-section-title">
            基本信息
          </Typography.Title>
          <Table<BasicInfoRow>
            rowKey="key"
            className="detail-modal-table"
            tableLayout="fixed"
            dataSource={[
              {
                key: application.id,
                applicant: application.applicant.username,
                department: application.applicant.departmentName,
                status: application.status,
                createdAt: new Date(application.createdAt).toLocaleString(),
                reason: application.reason,
              },
            ]}
            columns={basicInfoColumns}
            pagination={false}
            size="small"
          />
          <Typography.Title level={5} className="detail-modal-section-title">
            资产明细
          </Typography.Title>
          <Table<ApplicationItem>
            rowKey="id"
            className="detail-modal-table"
            tableLayout="fixed"
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
