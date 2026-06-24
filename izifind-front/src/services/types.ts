export interface Permission {
  id: number
  name: string
  description?: string | null
}

export interface Role {
  id: number
  name: string
  description?: string | null
  permissions: Permission[]
}

export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  is_superuser: boolean
  roles: Role[]
  commissariat?: Commissariat | null
}

export interface Category {
  id: number
  name: string
  description?: string | null
}

export interface SousCategorie {
  id: number
  name: string
  description?: string | null
  categorie_id: number
}

export interface Marque {
  id: number
  name: string
  souscategorie_id: number
}

export interface Couleur {
  id: number
  name: string
  hex_code?: string | null
}

export interface Statut {
  id: number
  name: string
  description?: string | null
}

export interface Commissariat {
  id: number
  name: string
  address?: string | null
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface ObjectRecord {
  id: number
  categorie_id?: number | null
  souscategorie_id?: number | null
  marque_id?: number | null
  couleur_id?: number | null
  statut_id: number
  description: string
  date: string
  date_action: string
  lieu?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  recompense?: string | null
  is_public: boolean
}

export interface ObjectPayload {
  categorie_id?: number | null
  souscategorie_id?: number | null
  marque_id?: number | null
  couleur_id?: number | null
  statut_id: number
  description: string
  date_action: string
  lieu?: string
  contact_phone?: string
  contact_email?: string
  recompense?: string
  is_public: boolean
}

export interface Statistics {
  perdus: number
  trouves: number
  postes: number
}
