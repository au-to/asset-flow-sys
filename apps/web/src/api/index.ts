import client, { ApiResponse } from './client';
import { ApplicationStatus, AssetCategory } from '@asset-flow/shared';

export interface ApplicationItem {
  id?: string;
  category: AssetCategory;
  assetName: string;
  quantity: number;
  assetKey?: string | null;
}

export interface Application {
  id: string;
  reason: string;
  status: ApplicationStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  applicant: {
    id: string;
    username: string;
    departmentName: string;
  };
  items: ApplicationItem[];
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}

export const applicationsApi = {
  create: (data: { reason: string; items: Omit<ApplicationItem, 'id' | 'assetKey'>[] }) =>
    client.post<unknown, ApiResponse<Application>>('/applications', data),
  mine: (page = 1, pageSize = 10) =>
    client.get<unknown, ApiResponse<PaginatedResult<Application>>>('/applications/mine', {
      params: { page, pageSize },
    }),
  getById: (id: string) =>
    client.get<unknown, ApiResponse<Application>>(`/applications/${id}`),
  withdraw: (id: string) =>
    client.post<unknown, ApiResponse<Application>>(`/applications/${id}/withdraw`),
};

export const approvalsApi = {
  pending: (page = 1, pageSize = 10) =>
    client.get<unknown, ApiResponse<PaginatedResult<Application>>>('/approvals/pending', {
      params: { page, pageSize },
    }),
  all: (page = 1, pageSize = 10) =>
    client.get<unknown, ApiResponse<PaginatedResult<Application>>>('/approvals/all', {
      params: { page, pageSize },
    }),
  approve: (id: string) =>
    client.post<unknown, ApiResponse<Application>>(`/approvals/${id}/approve`),
  reject: (id: string, reason: string) =>
    client.post<unknown, ApiResponse<Application>>(`/approvals/${id}/reject`, { reason }),
  terminate: (id: string) =>
    client.post<unknown, ApiResponse<Application>>(`/approvals/${id}/terminate`),
};

export interface AuditLog {
  id: string;
  action: string;
  reason: string | null;
  beforeStatus: ApplicationStatus | null;
  afterStatus: ApplicationStatus;
  createdAt: string;
  operator: { id: string; username: string };
  applicant: { id: string; username: string };
  applicationId: string;
  assetKey: string;
}

export const auditApi = {
  logs: (params: Record<string, string | number | undefined>) =>
    client.get<unknown, ApiResponse<PaginatedResult<AuditLog>>>('/audit/logs', { params }),
  exportUrl: (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.set(k, v);
    });
    const token = localStorage.getItem('token');
    return `/api/audit/export?${query.toString()}&token=${token}`;
  },
};
