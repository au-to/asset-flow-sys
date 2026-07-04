import client, { ApiResponse } from './client';
import { Role } from '@asset-flow/shared';

export interface UserInfo {
  id: string;
  username: string;
  role: Role;
  departmentId: string;
  departmentName: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}

export const authApi = {
  login: (username: string, password: string) =>
    client.post<unknown, ApiResponse<LoginResult>>('/auth/login', { username, password }),
  me: () => client.get<unknown, ApiResponse<UserInfo>>('/auth/me'),
};
