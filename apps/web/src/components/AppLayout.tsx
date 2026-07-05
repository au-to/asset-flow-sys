import { useState, type ReactNode } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, theme, Grid, Drawer } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FormOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuthStore, hasRole } from '../stores/authStore';
import { Role } from '@asset-flow/shared';

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const ROLE_LABELS: Record<Role, string> = {
  [Role.EMPLOYEE]: '普通员工',
  [Role.MANAGER]: '部门主管',
  [Role.ADMIN]: '系统管理员',
  [Role.AUDITOR]: '合规审计员',
};

function SidebarContent({
  menuItems,
  selectedKey,
  onNavigate,
  userMenuItems,
  username,
  roleLabel,
  token,
}: {
  menuItems: { key: string; icon: ReactNode; label: string }[];
  selectedKey: string;
  onNavigate: (key: string) => void;
  userMenuItems: { key: string; icon: ReactNode; label: string; danger?: boolean; onClick?: () => void }[];
  username?: string;
  roleLabel: string;
  token: ReturnType<typeof theme.useToken>['token'];
}) {
  return (
    <>
      <div className="app-sider-top">
        <div className="app-sider-logo">
          <div className="app-sider-logo-icon">AF</div>
          <span className="app-sider-logo-text">资产流转系统</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => onNavigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </div>
      <div className="app-sider-user">
        <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
          <Button type="text" className="app-sider-user-btn">
            <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
            <div className="app-sider-user-info">
              <Typography.Text strong style={{ color: '#fff', display: 'block', lineHeight: 1.4 }}>
                {username}
              </Typography.Text>
              <Typography.Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                {roleLabel}
              </Typography.Text>
            </div>
          </Button>
        </Dropdown>
      </div>
    </>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleNavigate = (key: string) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const sidebarProps = {
    menuItems,
    selectedKey: location.pathname,
    onNavigate: handleNavigate,
    userMenuItems,
    username: user?.username,
    roleLabel: user?.role ? ROLE_LABELS[user.role] : '',
    token,
  };

  return (
    <Layout className="app-layout">
      {!isMobile && (
        <Sider width={220} className="app-sider">
          <div className="app-sider-inner">
            <SidebarContent {...sidebarProps} />
          </div>
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          className="app-sider-drawer"
          styles={{ body: { padding: 0, background: '#0f172a' } }}
        >
          <div className="app-sider-inner app-sider-inner-drawer">
            <SidebarContent {...sidebarProps} />
          </div>
        </Drawer>
      )}

      <Layout className={`app-main${isMobile ? ' app-main-mobile' : ''}`}>
        {isMobile && (
          <header className="app-mobile-header">
            <Button
              type="text"
              icon={<MenuOutlined />}
              aria-label="打开导航菜单"
              onClick={() => setDrawerOpen(true)}
              className="app-mobile-menu-btn"
            />
            <span className="app-mobile-header-title">资产流转系统</span>
          </header>
        )}
        <Content className="app-content" style={{ background: token.colorBgLayout }}>
          <div className="page-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
