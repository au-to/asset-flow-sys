import type { ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563EB',
    colorSuccess: '#059669',
    colorError: '#DC2626',
    colorWarning: '#D97706',
    colorInfo: '#3B82F6',
    colorBgLayout: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorText: '#0F172A',
    colorTextSecondary: '#64748B',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily:
      "'Fira Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    controlHeight: 36,
    motionDurationMid: '0.2s',
  },
  components: {
    Layout: {
      siderBg: '#0F172A',
      headerBg: '#FFFFFF',
      bodyBg: '#F8FAFC',
      triggerBg: '#1E293B',
    },
    Menu: {
      darkItemBg: '#0F172A',
      darkSubMenuItemBg: '#0F172A',
      darkItemSelectedBg: '#2563EB',
      darkItemHoverBg: '#1E293B',
    },
    Card: {
      headerBg: 'transparent',
      paddingLG: 24,
    },
    Table: {
      headerBg: '#F8FAFC',
      headerColor: '#475569',
      rowHoverBg: '#F1F5F9',
    },
    Button: {
      primaryShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
    },
  },
};
