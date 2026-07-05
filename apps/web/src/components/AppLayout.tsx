import { Layout, Menu, Button, Typography, Avatar, Dropdown, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FormOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore, hasRole } from '../stores/authStore';
import { Role } from '@asset-flow/shared';

const { Content, Sider } = Layout;

const ROLE_LABELS: Record<Role, string> = {
  [Role.EMPLOYEE]: '普通员工',
  [Role.MANAGER]: '部门主管',
  [Role.ADMIN]: '系统管理员',
  [Role.AUDITOR]: '合规审计员',
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { token } = theme.useToken();

  const menuItems = [
    { key: '/application', icon: <FormOutlined />, label: '资产申请' },
    { key: '/approval', icon: <CheckSquareOutlined />, label: '审批工作台' },
    ...(hasRole(user, [Role.ADMIN, Role.AUDITOR])
      ? [{ key: '/audit', icon: <AuditOutlined />, label: '审计日志' }]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        clearAuth();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout className="app-layout">
      <Sider width={220} className="app-sider">
        <div className="app-sider-inner">
          <div className="app-sider-top">
            <div className="app-sider-logo">
              <div className="app-sider-logo-icon">AF</div>
              <span className="app-sider-logo-text">资产流转系统</span>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ borderInlineEnd: 'none' }}
            />
          </div>
          <div className="app-sider-user">
            <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
              <Button type="text" className="app-sider-user-btn">
                <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
                <div className="app-sider-user-info">
                  <Typography.Text strong style={{ color: '#fff', display: 'block', lineHeight: 1.4 }}>
                    {user?.username}
                  </Typography.Text>
                  <Typography.Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                    {user?.role ? ROLE_LABELS[user.role] : ''}
                  </Typography.Text>
                </div>
              </Button>
            </Dropdown>
          </div>
        </div>
      </Sider>
      <Layout className="app-main">
        <Content className="app-content" style={{ background: token.colorBgLayout }}>
          <div className="page-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
