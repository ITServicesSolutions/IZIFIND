import api from './api'
import type { Marque, Couleur, Statut } from './types'

export async function getMarques() {
  const { data } = await api.get<Marque[]>('/marques')
  return data
}

export async function getMarquesBySousCategorie(souscategorieId: number) {
  const { data } = await api.get<Marque[]>(`/marques/par-souscategorie/${souscategorieId}`)
  return data
}

export async function getCouleurs() {
  const { data } = await api.get<Couleur[]>('/couleurs')
  return data
}

export async function getStatuts() {
  const { data } = await api.get<Statut[]>('/statuts')
  return data
}
