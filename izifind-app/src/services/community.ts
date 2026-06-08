import { http } from './http';
import type { Temoignage } from '@/types/api';

export async function createTemoignage(objetId: number, contenu: string) {
  const { data } = await http.post<Temoignage>('/temoignages/', {
    objet_id: objetId,
    contenu,
  });

  return data;
}
