import { useCallback, useEffect, useState } from 'react';
import { Card, Table, Form, Select, DatePicker, Button, Space, Input, message } from 'antd';
import dayjs from 'dayjs';
import {
  ApplicationStatus,
  AssetCategory,
  APPLICATION_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
} from '@asset-flow/shared';
import { auditApi, AuditLog } from '../../api';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import client from '../../api/client';

const { RangePicker } = DatePicker;

export default function AuditPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async (values?: Record<string, unknown>, p = page) => {
    const v = values ?? form.getFieldsValue();
    const params: Record<string, string | number | undefined> = {
      page: p,
      pageSize: 20,
      applicantId: v.applicantId,
      category: v.category,
      status: v.status,
      startTime: v.timeRange?.[0]?.toISOString(),
      endTime: v.timeRange?.[1]?.toISOString(),
    };
    const res = await auditApi.logs(params);
    setData(res.data.list);
    setTotal(res.data.total);
  }, [form, page]);

  const debouncedSearch = useDebounceCallback((values: Record<string, unknown>) => {
    setPage(1);
    fetchLogs(values, 1);
  }, 300);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const onExport = async () => {
    setExporting(true);
    try {
      const v = form.getFieldsValue();
      const params = {
        applicantId: v.applicantId,
        category: v.category,
        status: v.status,
        startTime: v.timeRange?.[0]?.toISOString(),
        endTime: v.timeRange?.[1]?.toISOString(),
      };
      const response = await client.get('/audit/export', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { title: '操作时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString() },
    { title: '操作人', dataIndex: ['operator', 'username'] },
    { title: '申请人', dataIndex: ['applicant', 'username'] },
    { title: '动作', dataIndex: 'action' },
    { title: '驳回原因', dataIndex: 'reason', render: (v: string | null) => v || '-' },
    {
      title: '前置状态',
      dataIndex: 'beforeStatus',
      render: (v: ApplicationStatus | null) => (v ? APPLICATION_STATUS_LABELS[v] : '-'),
    },
    {
      title: '后置状态',
      dataIndex: 'afterStatus',
      render: (v: ApplicationStatus) => APPLICATION_STATUS_LABELS[v],
    },
    { title: '资产Key', dataIndex: 'assetKey' },
  ];

  return (
    <Card
      title="资产流转审计日志"
      extra={
        <Button type="primary" loading={exporting} onClick={onExport}>
          导出 Excel
        </Button>
      }
    >
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 16 }}
        onValuesChange={(_, allValues) => debouncedSearch(allValues)}
      >
        <Form.Item name="applicantId" label="申请人ID">
          <Input placeholder="申请人ID" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="category" label="资产分类">
          <Select
            allowClear
            style={{ width: 140 }}
            options={Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Form.Item>
        <Form.Item name="status" label="单据状态">
          <Select
            allowClear
            style={{ width: 120 }}
            options={Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Form.Item>
        <Form.Item name="timeRange" label="申请时间">
          <RangePicker showTime />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={() => { setPage(1); fetchLogs(undefined, 1); }}>
              查询
            </Button>
            <Button onClick={() => { form.resetFields(); setPage(1); fetchLogs({}, 1); }}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          total,
          onChange: (p) => setPage(p),
        }}
      />
    </Card>
  );
}
