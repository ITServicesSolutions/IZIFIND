import api from './api'
import type { Category, SousCategorie } from './types'

export async function getCategories() {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function createCategory(payload: Pick<Category, 'name' | 'description'>) {
  const { data } = await api.post<Category>('/categories', payload)
  return data
}

export async function getSousCategories() {
  const { data } = await api.get<SousCategorie[]>('/sous-categories')
  return data
}

export async function getSousCategoriesByCategorie(categorieId: number) {
  const { data } = await api.get<SousCategorie[]>(`/sous-categories/par-categorie/${categorieId}`)
  return data
}

export async function createSousCategorie(payload: Pick<SousCategorie, 'name' | 'description' | 'categorie_id'>) {
  const { data } = await api.post<SousCategorie>('/sous-categories', payload)
  return data
}
