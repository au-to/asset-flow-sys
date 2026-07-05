import { useCallback, useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Form, Input, Modal, Empty, Spin } from 'antd';
import { Role, ApplicationStatus } from '@asset-flow/shared';
import { useAuthStore } from '../../stores/authStore';
import { applicationsApi, approvalsApi, Application } from '../../api';
import { ApplicationDetailModal, useActionLoading } from './components';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

export default function ApprovalPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Application | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectForm] = Form.useForm();
  const { loadingId, wrap } = useActionLoading();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let res;
      if (user.role === Role.MANAGER) {
        res = await approvalsApi.pending(page);
      } else if (user.role === Role.ADMIN) {
        res = await approvalsApi.all(page);
      } else {
        res = await applicationsApi.mine(page);
      }
      setData(res.data.list);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    load();
  }, [load]);

  const pageTitle =
    user?.role === Role.MANAGER
      ? '待我审批'
      : user?.role === Role.ADMIN
        ? '全量申请单'
        : '我提交的申请';

  const pageDescription =
    user?.role === Role.MANAGER
      ? '查看并处理下属提交的资产申请'
      : user?.role === Role.ADMIN
        ? '管理系统内所有资产申请单，可强制终止异常流程'
        : '跟踪您提交的申请进度，待审批状态可撤回';

  const columns = [
    { title: '申请人', dataIndex: ['applicant', 'username'], width: 120 },
    { title: '部门', dataIndex: ['applicant', 'departmentName'], width: 120 },
    { title: '申请原因', dataIndex: 'reason', width: 200, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: ApplicationStatus) => <StatusBadge status={s} />,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => (
        <span className="tabular-nums">{new Date(v).toLocaleString()}</span>
      ),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: Application) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => setDetail(record)}>
            详情
          </Button>
          {user?.role === Role.EMPLOYEE && record.status === ApplicationStatus.PENDING && (
            <Button
              size="small"
              loading={loadingId === record.id}
              disabled={!!loadingId}
              onClick={() =>
                wrap(record.id, async () => {
                  await applicationsApi.withdraw(record.id);
                  message.success('撤回成功');
                  load();
                })
              }
            >
              撤回
            </Button>
          )}
          {user?.role === Role.ADMIN && record.status === ApplicationStatus.PENDING && (
            <Button
              danger
              size="small"
              loading={loadingId === `terminate-${record.id}`}
              disabled={!!loadingId}
              onClick={() =>
                wrap(`terminate-${record.id}`, async () => {
                  await approvalsApi.terminate(record.id);
                  message.success('已强制终止');
                  load();
                })
              }
            >
              强制终止
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const detailFooter =
    detail && user?.role === Role.MANAGER && detail.status === ApplicationStatus.PENDING ? (
      <Space>
        <Button onClick={() => setDetail(null)} disabled={!!loadingId}>
          关闭
        </Button>
        <Button
          danger
          disabled={!!loadingId}
          onClick={() => {
            setRejectId(detail.id);
            setRejectOpen(true);
          }}
        >
          驳回
        </Button>
        <Button
          type="primary"
          loading={loadingId === `approve-${detail.id}`}
          disabled={!!loadingId}
          onClick={() =>
            wrap(`approve-${detail.id}`, async () => {
              await approvalsApi.approve(detail.id);
              message.success('审批通过');
              setDetail(null);
              load();
            })
          }
        >
          同意
        </Button>
      </Space>
    ) : undefined;

  return (
    <>
      <PageHeader title={`审批工作台 · ${pageTitle}`} description={pageDescription} />
      <Card className="page-card" variant="borderless">
        <Spin spinning={loading}>
          <div className="table-scroll-wrapper">
            <Table
              rowKey="id"
              dataSource={data}
              columns={columns}
              scroll={{ x: 900 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      user?.role === Role.MANAGER
                        ? '暂无待审批申请'
                        : '暂无申请记录'
                    }
                  />
                ),
              }}
              pagination={{
                current: page,
                total,
                showSizeChanger: false,
                showTotal: (t) => `共 ${t} 条`,
                onChange: setPage,
              }}
            />
          </div>
        </Spin>
      </Card>
      <ApplicationDetailModal
        open={!!detail}
        application={detail}
        onClose={() => setDetail(null)}
        footer={detailFooter}
      />
      <Modal
        title="驳回申请"
        open={rejectOpen}
        onCancel={() => {
          setRejectOpen(false);
          rejectForm.resetFields();
        }}
        onOk={async () => {
          const values = await rejectForm.validateFields();
          if (!rejectId) return;
          await wrap(`reject-${rejectId}`, async () => {
            await approvalsApi.reject(rejectId, values.reason);
            message.success('已驳回');
            setRejectOpen(false);
            setDetail(null);
            rejectForm.resetFields();
            load();
          });
        }}
        confirmLoading={!!rejectId && loadingId === `reject-${rejectId}`}
        destroyOnHidden
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="驳回原因"
            rules={[{ required: true, message: '请填写驳回原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请填写驳回原因" showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
