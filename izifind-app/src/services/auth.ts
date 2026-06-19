import { http } from './http';
import type { TokenResponse, User } from '@/types/api';

export interface RegisterPayload {
  username: string;
  email: string;
  phone?: string;
  password: string;
}

export async function loginRequest(username: string, password: string) {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const { data } = await http.post<TokenResponse>('/auth/login', form.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return data;
}

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await http.post<User>('/auth/register', payload);
  return data;
}

export async function googleLoginRequest(idToken: string) {
  const { data } = await http.post<TokenResponse>('/auth/google', { id_token: idToken });
  return data;
}

export async function fetchMe() {
  const { data } = await http.get<User>('/auth/me');
  return data;
}

export async function forgotPasswordRequest(email: string) {
  const { data } = await http.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPasswordRequest(token: string, newPassword: string) {
  const { data } = await http.post('/auth/reset-password', { token, new_password: newPassword });
  return data;
}

export async function updateProfileRequest(payload: Partial<User>) {
  const { data } = await http.put<User>('/auth/me', payload);
  return data;
}

export async function changePasswordRequest(oldPassword: string, newPassword: string) {
  const { data } = await http.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
  return data;
}
