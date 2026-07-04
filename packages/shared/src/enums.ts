export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  TERMINATED = 'TERMINATED',
}

export enum AssetCategory {
  FIXED_ASSET = 'FIXED_ASSET',
  ELECTRONIC_DEVICE = 'ELECTRONIC_DEVICE',
  SOFTWARE_LICENSE = 'SOFTWARE_LICENSE',
  SENSITIVE_DATA = 'SENSITIVE_DATA',
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  [AssetCategory.FIXED_ASSET]: '固定资产',
  [AssetCategory.ELECTRONIC_DEVICE]: '电子设备',
  [AssetCategory.SOFTWARE_LICENSE]: '软件许可证',
  [AssetCategory.SENSITIVE_DATA]: '敏感数据权限',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: '待审批',
  [ApplicationStatus.APPROVED]: '已通过',
  [ApplicationStatus.REJECTED]: '已驳回',
  [ApplicationStatus.WITHDRAWN]: '已撤回',
  [ApplicationStatus.TERMINATED]: '已终止',
};
