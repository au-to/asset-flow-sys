import { useEffect } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Space, message, Typography } from 'antd';
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

export default function ApplicationPage() {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    authApi.me().then((res) => {
      form.setFieldsValue({
        applicant: res.data.username,
        department: res.data.departmentName,
      });
    });
  }, [form]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      await applicationsApi.create({
        reason: values.reason,
        items: values.items,
      });
      message.success('提交成功，已进入待审批状态');
      form.resetFields(['reason', 'items']);
      form.setFieldsValue({
        applicant: user?.username,
        department: user?.departmentName,
        items: [{ category: AssetCategory.ELECTRONIC_DEVICE, assetName: '', quantity: 1 }],
      });
      navigate('/approval');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('提交失败');
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
          items: [{ category: AssetCategory.ELECTRONIC_DEVICE, assetName: '', quantity: 1 }],
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
        <Form.List
          name="items"
          rules={[
            {
              validator: async (_, items) => {
                if (!items || items.length < 1) {
                  return Promise.reject(new Error('至少添加一条资产明细'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'category']}
                    rules={[{ required: true, message: '请选择资产分类' }]}
                  >
                    <Select style={{ width: 160 }} options={categoryOptions} placeholder="资产分类" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'assetName']}
                    rules={[{ required: true, message: '请填写资产名称' }]}
                  >
                    <Input placeholder="资产名称" style={{ width: 180 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    rules={[
                      { required: true, message: '请填写数量' },
                      { type: 'number', min: 1, message: '数量必须为正整数' },
                    ]}
                  >
                    <InputNumber min={1} precision={0} placeholder="数量" style={{ width: 100 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加资产明细
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Button type="primary" onClick={onSubmit}>
          提交申请
        </Button>
      </Form>
    </Card>
  );
}
