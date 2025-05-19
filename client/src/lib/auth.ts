import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const res = await apiRequest('POST', '/api/auth/login', credentials);
  const user = await res.json();
  
  // Invalidate any user-related queries to refetch data
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  return user;
};

export const register = async (data: RegisterData) => {
  const res = await apiRequest('POST', '/api/auth/register', data);
  return res.json();
};

export const logout = async () => {
  const res = await apiRequest('POST', '/api/auth/logout');
  
  // Clear user-related queries from cache
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  return res.json();
};

export const getCurrentUser = async () => {
  const res = await apiRequest('GET', '/api/auth/me');
  return res.json();
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};
