import api from './api'
import type { ImageObjet } from './types'

export async function getImages() {
  const { data } = await api.get<ImageObjet[]>('/images')
  return data
}
