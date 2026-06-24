import api from './api'
import type { Statistics } from './types'

export async function getStatistics() {
  const { data } = await api.get<Statistics>('/statistiques')
  return data
}
