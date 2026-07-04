import { useCallback, useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Form, Input, Modal } from 'antd';
import { Role, ApplicationStatus, APPLICATION_STATUS_LABELS } from '@asset-flow/shared';
import { useAuthStore } from '../../stores/authStore';
import { applicationsApi, approvalsApi, Application } from '../../api';
import { ApplicationDetailModal, useActionLoading } from './components';

export default function ApprovalPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Application | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectForm] = Form.useForm();
  const { loadingId, wrap } = useActionLoading();

  const load = useCallback(async () => {
    if (!user) return;
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
  }, [user, page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { title: '申请人', dataIndex: ['applicant', 'username'] },
    { title: '部门', dataIndex: ['applicant', 'departmentName'] },
    { title: '申请原因', dataIndex: 'reason', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: ApplicationStatus) => APPLICATION_STATUS_LABELS[s],
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: '操作',
      render: (_: unknown, record: Application) => (
        <Space>
          <Button size="small" onClick={() => setDetail(record)}>
            查看详情
          </Button>
          {user?.role === Role.EMPLOYEE && record.status === ApplicationStatus.PENDING && (
            <Button
              size="small"
              loading={loadingId === record.id}
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
          {user?.role === Role.MANAGER && record.status === ApplicationStatus.PENDING && (
            <>
              <Button
                type="primary"
                size="small"
                loading={loadingId === `approve-${record.id}`}
                onClick={() =>
                  wrap(`approve-${record.id}`, async () => {
                    await approvalsApi.approve(record.id);
                    message.success('审批通过');
                    load();
                  })
                }
              >
                同意
              </Button>
              <Button
                danger
                size="small"
                onClick={() => {
                  setRejectId(record.id);
                  setRejectOpen(true);
                }}
              >
                驳回
              </Button>
            </>
          )}
          {user?.role === Role.ADMIN && record.status === ApplicationStatus.PENDING && (
            <Button
              danger
              size="small"
              loading={loadingId === `terminate-${record.id}`}
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

  const title =
    user?.role === Role.MANAGER
      ? '待我审批'
      : user?.role === Role.ADMIN
        ? '全量申请单'
        : '我提交的申请';

  return (
    <Card title={`审批工作台 - ${title}`}>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          total,
          onChange: setPage,
        }}
      />
      <ApplicationDetailModal open={!!detail} application={detail} onClose={() => setDetail(null)} />
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
            rejectForm.resetFields();
            load();
          });
        }}
        confirmLoading={!!rejectId && loadingId === `reject-${rejectId}`}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="驳回原因"
            rules={[{ required: true, message: '请填写驳回原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请填写驳回原因" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
