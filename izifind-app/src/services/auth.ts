import { http } from './http';
import type { TokenResponse, User } from '@/types/api';

export interface RegisterPayload {
  username: string;
  email: string;
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

export async function fetchMe() {
  const { data } = await http.get<User>('/auth/me');
  return data;
}

