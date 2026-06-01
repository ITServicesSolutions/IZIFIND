export type AdminResourceKey =
  | 'categories'
  | 'sous-categories'
  | 'marques'
  | 'couleurs'
  | 'statuts'
  | 'titres'
  | 'objets'
  | 'images'
  | 'modifications'
  | 'promesses'
  | 'temoignages'
  | 'commissariats'
  | 'permissions'

export interface AdminResourceConfig {
  key: AdminResourceKey
  label: string
  subtitle: string
  path: string
  endpoint: string
  icon: string
  fields: string[]
  deletable?: boolean
  deletePath?: (id: number) => string
}

export const ADMIN_MENU_RESOURCES: AdminResourceConfig[] = [
  {
    key: 'categories',
    label: 'Categories',
    subtitle: 'Classement principal des objets.',
    path: '/admin/categories',
    endpoint: '/categories',
    icon: 'grid',
    fields: ['id', 'name', 'description'],
    deletable: true,
    deletePath: (id) => `/categories/${id}`,
  },
  {
    key: 'sous-categories',
    label: 'Sous-categories',
    subtitle: 'Sous-niveaux rattachés aux categories.',
    path: '/admin/sous-categories',
    endpoint: '/sous-categories',
    icon: 'layers',
    fields: ['id', 'name', 'categorie_id', 'description'],
    deletable: true,
    deletePath: (id) => `/sous-categories/${id}`,
  },
  {
    key: 'marques',
    label: 'Marques',
    subtitle: 'Marques disponibles dans le référentiel.',
    path: '/admin/marques',
    endpoint: '/marques',
    icon: 'tag',
    fields: ['id', 'name', 'souscategorie_id', 'description'],
    deletable: true,
    deletePath: (id) => `/marques/${id}`,
  },
  {
    key: 'couleurs',
    label: 'Couleurs',
    subtitle: 'Palette de couleurs métier.',
    path: '/admin/couleurs',
    endpoint: '/couleurs',
    icon: 'palette',
    fields: ['id', 'name', 'description'],
    deletable: true,
    deletePath: (id) => `/couleurs/${id}`,
  },
  {
    key: 'statuts',
    label: 'Statuts',
    subtitle: 'État des objets suivis par la plateforme.',
    path: '/admin/statuts',
    endpoint: '/statuts',
    icon: 'status',
    fields: ['id', 'name', 'description'],
    deletable: true,
    deletePath: (id) => `/statuts/${id}`,
  },
  {
    key: 'titres',
    label: 'Titres objets',
    subtitle: 'Intitulés spécialisés liés aux sous-catégories.',
    path: '/admin/titres',
    endpoint: '/titres-objets',
    icon: 'bookmark',
    fields: ['id', 'name', 'type_id', 'description'],
    deletable: true,
    deletePath: (id) => `/titres-objets/${id}`,
  },
  {
    key: 'objets',
    label: 'Objets',
    subtitle: 'Déclarations et objets visibles.',
    path: '/admin/objets',
    endpoint: '/objets?is_public=false',
    icon: 'table',
    fields: ['id', 'statut_id', 'description', 'date_action', 'is_public'],
    deletable: true,
    deletePath: (id) => `/objets/${id}`,
  },
  {
    key: 'images',
    label: 'Images',
    subtitle: 'Fichiers liés aux objets.',
    path: '/admin/images',
    endpoint: '/images',
    icon: 'image',
    fields: ['id', 'objet_id', 'name', 'image_url', 'caption'],
    deletable: true,
    deletePath: (id) => `/images/${id}`,
  },
  {
    key: 'modifications',
    label: 'Modifications',
    subtitle: 'Demandes de correction sur les objets.',
    path: '/admin/modifications',
    endpoint: '/modifications',
    icon: 'spark',
    fields: ['id', 'objet_id', 'change', 'confirm', 'date'],
    deletable: true,
    deletePath: (id) => `/modifications/${id}`,
  },
  {
    key: 'promesses',
    label: 'Promesses',
    subtitle: 'Récompenses associées aux objets perdus.',
    path: '/admin/promesses',
    endpoint: '/promesses',
    icon: 'coin',
    fields: ['id', 'objet_id', 'montant', 'pourcentage_frais'],
    deletable: true,
    deletePath: (id) => `/promesses/${id}`,
  },
  {
    key: 'temoignages',
    label: 'Temoignages',
    subtitle: 'Retours après récupération.',
    path: '/admin/temoignages',
    endpoint: '/temoignages',
    icon: 'message',
    fields: ['id', 'objet_id', 'user_id', 'contenu', 'date'],
    deletable: true,
    deletePath: (id) => `/temoignages/${id}`,
  },
  {
    key: 'commissariats',
    label: 'Commissariats',
    subtitle: 'Points physiques de prise en charge.',
    path: '/admin/commissariats',
    endpoint: '/commissariats',
    icon: 'map',
    fields: ['id', 'name', 'adresse', 'latitude', 'longitude'],
    deletable: true,
    deletePath: (id) => `/commissariats/${id}`,
  },
  {
    key: 'permissions',
    label: 'Permissions',
    subtitle: 'Autorisations fines du RBAC.',
    path: '/admin/permissions',
    endpoint: '/rbac/permissions',
    icon: 'key',
    fields: ['id', 'name', 'description'],
  },
]

export const getAdminResource = (key: AdminResourceKey) =>
  ADMIN_MENU_RESOURCES.find((resource) => resource.key === key)
