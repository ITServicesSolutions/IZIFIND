import api from './api'
import type { ObjectPayload, ObjectRecord } from './types'

export const LOST_STATUS_ID = 1
export const FOUND_STATUS_ID = 2

export interface GetObjectsParams {
  skip?: number
  limit?: number
  categorie?: number
  souscategorie?: number
  marque?: number
  couleur?: number
  statut?: number
  search?: string
}

export async function getObjects(params?: GetObjectsParams) {
  const { data } = await api.get<ObjectRecord[]>('/objets', { params })
  return data
}

export async function createObject(payload: ObjectPayload) {
  const { data } = await api.post<ObjectRecord>('/objets', payload)
  return data
}

export async function createDeclarationPerdu(payload: FormData) {
  const { data } = await api.post('/declarations/perdu', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function createDeclarationTrouve(payload: FormData) {
  const { data } = await api.post('/declarations/trouve', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
