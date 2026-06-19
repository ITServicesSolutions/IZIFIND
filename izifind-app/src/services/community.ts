import { http } from './http';
import type { Temoignage } from '@/types/api';

export async function createTemoignage(objetId: number, contenu: string, rating: number) {
  const { data } = await http.post<Temoignage>('/temoignages', {
    objet_id: objetId,
    contenu,
    rating,
  });

  return data;
}
