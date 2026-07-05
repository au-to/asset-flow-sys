import { useCallback, useEffect, useState } from 'react';
import { Card, Table, Form, Select, DatePicker, Button, Space, Input, message, Empty, Spin } from 'antd';
import { DownloadOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
} from '@asset-flow/shared';
import { auditApi, AuditLog } from '../../api';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import client from '../../api/client';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

const { RangePicker } = DatePicker;

export default function AuditPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async (values?: Record<string, unknown>, p = page) => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
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
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    { title: '操作人', dataIndex: ['operator', 'username'], width: 100 },
    { title: '申请人', dataIndex: ['applicant', 'username'], width: 100 },
    { title: '动作', dataIndex: 'action', width: 100 },
    {
      title: '驳回原因',
      dataIndex: 'reason',
      ellipsis: true,
      render: (v: string | null) => v || '-',
    },
    {
      title: '前置状态',
      dataIndex: 'beforeStatus',
      width: 100,
      render: (v: ApplicationStatus | null) =>
        v ? <StatusBadge status={v} /> : '-',
    },
    {
      title: '后置状态',
      dataIndex: 'afterStatus',
      width: 100,
      render: (v: ApplicationStatus) => <StatusBadge status={v} />,
    },
    {
      title: '资产 Key',
      dataIndex: 'assetKey',
      width: 140,
      render: (v: string) => v || '-',
    },
  ];

  return (
    <>
      <PageHeader
        title="资产流转审计日志"
        description="查询和导出资产申请的全链路操作记录，支持多维度筛选"
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<DownloadOutlined />} loading={exporting} onClick={onExport}>
          导出 Excel
        </Button>
      </div>
      <Card className="page-card" bordered={false}>
        <div className="filter-bar">
          <Form
            form={form}
            layout="inline"
            onValuesChange={(_, allValues) => debouncedSearch(allValues)}
            style={{ gap: '8px 0' }}
          >
            <Form.Item name="applicantId" label="申请人ID">
              <Input placeholder="申请人ID" allowClear style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="category" label="资产分类">
              <Select
                allowClear
                placeholder="全部"
                style={{ width: 140 }}
                options={Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Form.Item>
            <Form.Item name="status" label="单据状态">
              <Select
                allowClear
                placeholder="全部"
                style={{ width: 120 }}
                options={Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Form.Item>
            <Form.Item name="timeRange" label="申请时间">
              <RangePicker showTime />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setPage(1);
                    fetchLogs(undefined, 1);
                  }}
                >
                  查询
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setPage(1);
                    fetchLogs({}, 1);
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
        <Spin spinning={loading}>
          <div className="table-scroll-wrapper">
            <Table
              rowKey="id"
              dataSource={data}
              columns={columns}
              scroll={{ x: 1100 }}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无审计记录" />
                ),
              }}
              pagination={{
                current: page,
                total,
                showSizeChanger: false,
                showTotal: (t) => `共 ${t} 条`,
                onChange: (p) => setPage(p),
              }}
            />
          </div>
        </Spin>
      </Card>
    </>
  );
}
