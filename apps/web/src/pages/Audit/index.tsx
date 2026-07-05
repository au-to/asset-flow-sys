import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Table, Form, Select, DatePicker, Button, Input, message, Empty, Spin, Tag } from 'antd';
import { DownloadOutlined, ReloadOutlined, FilterOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
} from '@asset-flow/shared';
import { auditApi, AuditLog } from '../../api';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import client, { EXPORT_REQUEST_TIMEOUT_MS } from '../../api/client';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

const { RangePicker } = DatePicker;
const AUDIT_FILTER_COLLAPSED_KEY = 'audit-filter-collapsed';

function countActiveFilters(values: Record<string, unknown>): number {
  let count = 0;
  if ((values.applicantUsername as string | undefined)?.trim()) count++;
  if ((values.applicantId as string | undefined)?.trim()) count++;
  if (values.category) count++;
  if (values.status) count++;
  if (values.timeRange) count++;
  return count;
}

function buildQueryParams(values: Record<string, unknown>) {
  const timeRange = values.timeRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
  const applicantId = (values.applicantId as string | undefined)?.trim();
  const applicantUsername = (values.applicantUsername as string | undefined)?.trim();
  return {
    ...(applicantId ? { applicantId } : {}),
    ...(applicantUsername ? { applicantUsername } : {}),
    category: values.category as string | undefined,
    status: values.status as string | undefined,
    startTime: timeRange?.[0]?.startOf('day').toISOString(),
    endTime: timeRange?.[1]?.endOf('day').toISOString(),
  };
}

export default function AuditPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterCollapsed, setFilterCollapsed] = useState(
    () => localStorage.getItem(AUDIT_FILTER_COLLAPSED_KEY) === 'true',
  );
  const filterValues = Form.useWatch([], form);
  const activeFilterCount = useMemo(
    () => countActiveFilters(filterValues ?? {}),
    [filterValues],
  );

  const toggleFilterCollapsed = () => {
    setFilterCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(AUDIT_FILTER_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const fetchLogs = useCallback(async (values?: Record<string, unknown>, p = page) => {
    setLoading(true);
    try {
      const v = values ?? form.getFieldsValue();
      const res = await auditApi.logs({
        page: p,
        pageSize: 20,
        ...buildQueryParams(v),
      });
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
    if (exporting) return;
    setExporting(true);
    try {
      const params = buildQueryParams(form.getFieldsValue());
      const response = await client.get('/audit/export', {
        params,
        responseType: 'blob',
        timeout: EXPORT_REQUEST_TIMEOUT_MS,
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
      message.error('导出失败，数据量较大时请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  const filtersDisabled = loading || exporting;
  const exportDisabled = exporting;

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => (
        <span className="tabular-nums">{new Date(v).toLocaleString()}</span>
      ),
    },
    { title: '操作人', dataIndex: ['operator', 'username'], width: 130 },
    { title: '申请人', dataIndex: ['applicant', 'username'], width: 130 },
    { title: '动作', dataIndex: 'action', width: 100 },
    {
      title: '单据状态',
      dataIndex: 'applicationStatus',
      width: 100,
      render: (v: ApplicationStatus) => <StatusBadge status={v} />,
    },
    {
      title: '驳回原因',
      dataIndex: 'reason',
      width: 120,
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
        description="按申请单维度筛选操作记录，支持流式导出 Excel"
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={exporting}
            disabled={exportDisabled}
            onClick={onExport}
          >
            导出 Excel
          </Button>
        }
      />
      <Card className="page-card" variant="borderless">
        <div className={`audit-filter-bar${filterCollapsed ? ' audit-filter-bar-collapsed' : ''}`}>
          <div className="audit-filter-header">
            <div className="audit-filter-title">
              <FilterOutlined />
              <span>筛选条件</span>
              {activeFilterCount > 0 && (
                <Tag color="blue" className="audit-filter-tag">
                  {activeFilterCount} 项
                </Tag>
              )}
              {filterCollapsed && activeFilterCount > 0 && (
                <span className="audit-filter-summary">已启用 {activeFilterCount} 个筛选条件</span>
              )}
            </div>
            <button
              type="button"
              className="audit-filter-toggle"
              onClick={toggleFilterCollapsed}
              aria-expanded={!filterCollapsed}
              aria-label={filterCollapsed ? '展开筛选' : '收起筛选'}
            >
              <span>{filterCollapsed ? '展开' : '收起'}</span>
              {filterCollapsed ? <DownOutlined className="audit-filter-chevron" /> : <UpOutlined className="audit-filter-chevron" />}
            </button>
          </div>
          <div className={`audit-filter-body${filterCollapsed ? ' audit-filter-body-collapsed' : ''}`}>
            <Form
              form={form}
              layout="vertical"
              className="audit-filter-form"
              onValuesChange={(_, allValues) => debouncedSearch(allValues)}
            >
              <div className="audit-filter-grid">
                <Form.Item name="applicantUsername" label="申请人" className="audit-filter-field">
                  <Input placeholder="用户名，如 employee_a" allowClear disabled={filtersDisabled} />
                </Form.Item>
                <Form.Item name="applicantId" label="申请人 ID" className="audit-filter-field">
                  <Input placeholder="UUID" allowClear disabled={filtersDisabled} />
                </Form.Item>
                <Form.Item name="category" label="资产分类" className="audit-filter-field">
                  <Select
                    allowClear
                    placeholder="全部"
                    disabled={filtersDisabled}
                    options={Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                </Form.Item>
                <Form.Item name="status" label="单据状态" className="audit-filter-field">
                  <Select
                    allowClear
                    placeholder="全部"
                    disabled={filtersDisabled}
                    options={Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                </Form.Item>
                <Form.Item name="timeRange" label="申请时间" className="audit-filter-field">
                  <RangePicker allowEmpty disabled={filtersDisabled} style={{ width: '100%' }} />
                </Form.Item>
                <div className="audit-filter-actions">
                  <Button
                    icon={<ReloadOutlined />}
                    disabled={filtersDisabled}
                    onClick={() => {
                      form.resetFields();
                      setPage(1);
                      fetchLogs({}, 1);
                    }}
                  >
                    重置
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
        <Spin spinning={loading}>
          <div className="table-scroll-wrapper">
            <Table
              rowKey="id"
              dataSource={data}
              columns={columns}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无审计记录" />
                ),
              }}
              pagination={{
                current: page,
                total,
                pageSize: 20,
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
