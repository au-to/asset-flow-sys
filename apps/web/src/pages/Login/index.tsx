import { Card, Form, Input, Button, message, Typography, Space, Divider } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
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
    <div className="login-page">
      <div className="login-brand-panel">
        <h1>企业级资产流转与审批系统</h1>
        <p>
          统一管理固定资产、电子设备、软件许可证及敏感数据权限的申请与审批流程，保障资产流转合规可追溯。
        </p>
      </div>
      <div className="login-form-panel">
        <Card className="login-card" title="登录系统" variant="borderless">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ password: '123456' }}
            requiredMark="optional"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block size="large">
                登录
              </Button>
            </Form.Item>
          </Form>
          <Divider plain style={{ margin: '24px 0 16px', color: '#94a3b8', fontSize: 13 }}>
            测试账号（密码均为 123456）
          </Divider>
          <Space wrap size={[8, 8]}>
            {testAccounts.map((acc) => (
              <Button
                key={acc.username}
                size="small"
                className="test-account-btn"
                onClick={() => form.setFieldsValue({ username: acc.username, password: '123456' })}
              >
                {acc.username}
                <Typography.Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                  ({acc.role})
                </Typography.Text>
              </Button>
            ))}
          </Space>
        </Card>
      </div>
    </div>
  );
}
