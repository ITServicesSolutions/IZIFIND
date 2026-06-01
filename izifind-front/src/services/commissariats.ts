import api from './api'
import type { Commissariat, ObjectRecord } from './types'

export async function getCommissariats() {
  const { data } = await api.get<Commissariat[]>('/commissariats')
  return data
}

export async function validerObjetAuCommissariat(objetId: number) {
  const { data } = await api.put<ObjectRecord>(`/commissariats/objets/${objetId}/valider`)
  return data
}
