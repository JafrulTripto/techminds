import api from './api';
import { User } from '../types';
import { ApiResponse } from '../types';

export const userService = {
  getCurrentUser: async () => {
    return api.get<User>('/users/me');
  },
  
  getUserById: async (id: number) => {
    return api.get<ApiResponse<User>>(`/users/${id}`);
  },
  
  getAllUsers: async () => {
    return api.get<ApiResponse<User[]>>('/users');
  },
  
  updateUser: async (id: number, userData: Partial<User>) => {
    return api.put<ApiResponse<User>>(`/users/${id}`, userData);
  },
  
  deleteUser: async (id: number) => {
    return api.delete<ApiResponse<void>>(`/users/${id}`);
  },
  
  assignRoles: async (id: number, roles: string[]) => {
    return api.post<ApiResponse<User>>(`/users/${id}/roles`, roles);
  },
  
  verifyAccount: async (id: number) => {
    return api.post<ApiResponse<void>>(`/users/${id}/verify`);
  }
};

export default userService;
