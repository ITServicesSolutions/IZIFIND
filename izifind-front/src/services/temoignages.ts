import api from './api'
import type { Temoignage } from './types'

export async function getTemoignages() {
  const { data } = await api.get<Temoignage[]>('/temoignages')
  return data
}

export async function createTemoignage(objetId: number, contenu: string, rating: number) {
  const { data } = await api.post<Temoignage>('/temoignages', {
    objet_id: objetId,
    contenu,
    rating
  })
  return data
}
