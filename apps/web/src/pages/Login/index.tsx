import { Card, Form, Input, Button, message, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

const testAccounts = [
  { username: 'employee_a', role: '普通员工' },
  { username: 'manager_a', role: '研发部主管' },
  { username: 'manager_b', role: '市场部主管' },
  { username: 'admin', role: '系统管理员' },
  { username: 'auditor', role: '合规审计员' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await authApi.login(values.username, values.password);
      setAuth(res.data.token, res.data.user);
      message.success('登录成功');
      navigate('/application');
    } catch {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card title="企业级资产流转与审批系统" style={{ width: 420 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ password: '123456' }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
          测试账号（密码均为 123456）：
        </Typography.Paragraph>
        <Space wrap>
          {testAccounts.map((acc) => (
            <Button
              key={acc.username}
              size="small"
              onClick={() => form.setFieldsValue({ username: acc.username, password: '123456' })}
            >
              {acc.username}（{acc.role}）
            </Button>
          ))}
        </Space>
      </Card>
    </div>
  );
}
