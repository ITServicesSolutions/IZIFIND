import { http } from './http';

export async function listResource<T>(endpoint: string) {
  const { data } = await http.get<T[]>(endpoint);
  return data;
}

export async function createResource<T>(endpoint: string, payload: unknown) {
  const { data } = await http.post<T>(endpoint, payload);
  return data;
}

export async function updateResource<T>(endpoint: string, id: number, payload: unknown) {
  const { data } = await http.put<T>(`${endpoint}/${id}`, payload);
  return data;
}

export async function patchResource<T>(endpoint: string, id: number, payload: unknown) {
  const { data } = await http.patch<T>(`${endpoint}/${id}`, payload);
  return data;
}

export async function deleteResource(endpoint: string, id: number) {
  await http.delete(`${endpoint}/${id}`);
}

