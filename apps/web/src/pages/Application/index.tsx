import { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Typography,
  Alert,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AssetCategory, ASSET_CATEGORY_LABELS } from '@asset-flow/shared';
import { applicationsApi } from '../../api';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const categoryOptions = Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ASSET_NAME_PLACEHOLDER: Record<AssetCategory, string> = {
  [AssetCategory.FIXED_ASSET]: '如：办公桌椅、文件柜',
  [AssetCategory.ELECTRONIC_DEVICE]: '如：笔记本电脑、显示器',
  [AssetCategory.SOFTWARE_LICENSE]: '如：JetBrains、Office 365',
  [AssetCategory.SENSITIVE_DATA]: '如：生产库只读权限',
};

const DEFAULT_ITEM = {
  category: AssetCategory.ELECTRONIC_DEVICE,
  assetName: '',
  quantity: 1,
};

function onCategoryChange(
  form: ReturnType<typeof Form.useForm>[0],
  rowIndex: number,
  category: AssetCategory,
) {
  if (category === AssetCategory.SOFTWARE_LICENSE) {
    form.setFieldValue(['items', rowIndex, 'quantity'], 1);
  }
  if (category === AssetCategory.SENSITIVE_DATA) {
    const currentName = form.getFieldValue(['items', rowIndex, 'assetName']) as string;
    if (!currentName?.trim()) {
      form.setFieldValue(['items', rowIndex, 'assetName'], '数据访问权限');
    }
  }
}

export default function ApplicationPage() {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const items = Form.useWatch('items', form) as { category?: AssetCategory }[] | undefined;
  const hasSensitiveData = items?.some((item) => item?.category === AssetCategory.SENSITIVE_DATA);

  useEffect(() => {
    authApi.me().then((res) => {
      form.setFieldsValue({
        applicant: res.data.username,
        department: res.data.departmentName,
      });
    });
  }, [form]);

  const onSubmit = async () => {
    if (submitting) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await applicationsApi.create({
        reason: values.reason,
        items: values.items,
      });
      message.success('提交成功，已进入待审批状态');
      form.resetFields(['reason', 'items']);
      form.setFieldsValue({
        applicant: user?.username,
        department: user?.departmentName,
        items: [{ ...DEFAULT_ITEM }],
      });
      navigate('/approval');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="资产申请单">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          applicant: user?.username,
          department: user?.departmentName,
          items: [{ ...DEFAULT_ITEM }],
        }}
      >
        <Form.Item label="申请人" name="applicant">
          <Input disabled />
        </Form.Item>
        <Form.Item label="所属部门" name="department">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="申请原因"
          name="reason"
          rules={[
            { required: true, message: '请填写申请原因' },
            { max: 100, message: '申请原因不能超过100字' },
          ]}
        >
          <Input.TextArea rows={3} showCount maxLength={100} placeholder="请填写申请原因" />
        </Form.Item>

        <Typography.Title level={5}>资产明细</Typography.Title>
        {hasSensitiveData && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="敏感数据权限说明"
            description="选择「敏感数据权限」后，系统将自动生成权限 Key；列表与导出中将以 SEC-****-X 形式脱敏展示。"
          />
        )}
        <Form.List
          name="items"
          rules={[
            {
              validator: async (_, list) => {
                if (!list || list.length < 1) {
                  return Promise.reject(new Error('至少添加一条资产明细'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => {
                const category = items?.[name]?.category ?? AssetCategory.ELECTRONIC_DEVICE;
                const isSoftwareLicense = category === AssetCategory.SOFTWARE_LICENSE;
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <Space style={{ display: 'flex' }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                        rules={[{ required: true, message: '请选择资产分类' }]}
                      >
                        <Select
                          style={{ width: 160 }}
                          options={categoryOptions}
                          placeholder="资产分类"
                          onChange={(value: AssetCategory) => onCategoryChange(form, name, value)}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'assetName']}
                        rules={[{ required: true, message: '请填写资产名称' }]}
                      >
                        <Input
                          placeholder={ASSET_NAME_PLACEHOLDER[category] ?? '资产名称'}
                          style={{ width: 220 }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[
                          { required: true, message: '请填写数量' },
                          { type: 'integer', min: 1, message: '数量必须为正整数' },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={isSoftwareLicense ? 1 : undefined}
                          precision={0}
                          placeholder="数量"
                          style={{ width: 100 }}
                          disabled={isSoftwareLicense}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                    {category === AssetCategory.SENSITIVE_DATA && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        本行将自动生成权限 Key，审批通过后可在详情中查看脱敏编号
                      </Typography.Text>
                    )}
                    {isSoftwareLicense && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        软件许可证数量固定为 1
                      </Typography.Text>
                    )}
                  </div>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({ ...DEFAULT_ITEM })}
                  block
                  icon={<PlusOutlined />}
                >
                  添加资产明细
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Button type="primary" loading={submitting} disabled={submitting} onClick={onSubmit}>
          提交申请
        </Button>
      </Form>
    </Card>
  );
}
