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
  phone?: string | null
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
  adresse?: string | null
  phone?: string | null
  latitude: number
  longitude: number
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

export interface ImageObjet {
  id: number
  objet_id: number
  name: string
  image_url: string
  caption?: string | null
  date: string
}

export interface TestimonialUser {
  id: number
  username: string
}

export interface TitreObjet {
  id: number
  name: string
  type_id: number
  description?: string | null
}

export interface ModifierObjet {
  id: number
  objet_id: number
  change: string
  confirm: boolean
  date: string
}

export interface Promesse {
  id: number
  objet_id: number
  montant: number
  pourcentage_frais: number
  date: string
}

export interface Temoignage {
  id: number
  objet_id: number
  user_id: number
  user?: TestimonialUser | null
  contenu: string
  rating: number
  date: string
}

export interface Statistics {
  perdus: number
  trouves: number
  postes: number
}
