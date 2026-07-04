import { Layout, Menu, Button, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FormOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore, hasRole } from '../stores/authStore';
import { Role } from '@asset-flow/shared';

const { Header, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const menuItems = [
    { key: '/application', icon: <FormOutlined />, label: '资产申请' },
    { key: '/approval', icon: <CheckSquareOutlined />, label: '审批工作台' },
    ...(hasRole(user, [Role.ADMIN, Role.AUDITOR])
      ? [{ key: '/audit', icon: <AuditOutlined />, label: '审计日志' }]
      : []),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
          资产流转系统
        </Typography.Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1 }}
        />
        <Typography.Text style={{ color: '#fff' }}>
          {user?.username}（{user?.role}）
        </Typography.Text>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          style={{ color: '#fff' }}
          onClick={() => {
            clearAuth();
            navigate('/login');
          }}
        >
          退出
        </Button>
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
