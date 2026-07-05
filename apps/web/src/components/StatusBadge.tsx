import { Tag } from 'antd';
import { ApplicationStatus, APPLICATION_STATUS_LABELS } from '@asset-flow/shared';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'processing',
  [ApplicationStatus.APPROVED]: 'success',
  [ApplicationStatus.REJECTED]: 'error',
  [ApplicationStatus.WITHDRAWN]: 'default',
  [ApplicationStatus.TERMINATED]: 'warning',
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <Tag color={STATUS_COLORS[status]}>{APPLICATION_STATUS_LABELS[status]}</Tag>;
}
