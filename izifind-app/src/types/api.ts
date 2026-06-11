export interface Permission {
  id: number;
  name: string;
  description?: string | null;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  permissions: Permission[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  commissariat_id?: number | null;
  is_active: boolean;
  is_superuser: boolean;
  roles: Role[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface SousCategorie {
  id: number;
  categorie_id: number;
  name: string;
  description?: string | null;
}

export interface Marque {
  id: number;
  souscategorie_id: number;
  name: string;
  description?: string | null;
}

export interface Couleur {
  id: number;
  name: string;
  description?: string | null;
}

export interface Statut {
  id: number;
  name: string;
  description?: string | null;
}

export interface TitreObjet {
  id: number;
  type_id: number;
  name: string;
  description?: string | null;
}

export interface Commissariat {
  id: number;
  name: string;
  adresse?: string | null;
  latitude: number;
  longitude: number;
}

export interface Objet {
  id: number;
  categorie_id?: number | null;
  souscategorie_id?: number | null;
  marque_id?: number | null;
  couleur_id?: number | null;
  statut_id: number;
  description: string;
  date: string;
  date_action: string;
  lieu?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  recompense?: string | null;
  is_public: boolean;
}

export interface ObjetPayload {
  categorie_id?: number | null;
  souscategorie_id?: number | null;
  marque_id?: number | null;
  couleur_id?: number | null;
  statut_id: number;
  description: string;
  date_action: string;
  lieu?: string;
  contact_phone?: string;
  contact_email?: string;
  recompense?: string;
  is_public: boolean;
}

export interface ImageObjet {
  id: number;
  objet_id: number;
  name: string;
  image_url: string;
  caption?: string | null;
  date: string;
}

export interface ModifierObjet {
  id: number;
  objet_id: number;
  change: string;
  confirm: boolean;
  date: string;
}

export interface Promesse {
  id: number;
  objet_id: number;
  montant: number;
  pourcentage_frais: number;
  date: string;
}

export interface Temoignage {
  id: number;
  objet_id: number;
  user_id: number;
  contenu: string;
  date: string;
}

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
  | 'users'
  | 'roles';

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'select' | 'image' | 'readonly';

export interface ResourceFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  optionsKey?: keyof ResourceCollections;
  optionsLabelKey?: string;
  optionsValueKey?: string;
}

export interface ResourceCollections {
  categories: Category[];
  sousCategories: SousCategorie[];
  marques: Marque[];
  couleurs: Couleur[];
  statuts: Statut[];
  titres: TitreObjet[];
  objets: Objet[];
  images: ImageObjet[];
  modifications: ModifierObjet[];
  promesses: Promesse[];
  temoignages: Temoignage[];
  commissariats: Commissariat[];
  permissions: Permission[];
  users: User[];
  roles: Role[];
}

export interface AdminResourceConfig {
  key: AdminResourceKey;
  label: string;
  subtitle: string;
  endpoint: string;
  fields: ResourceFieldConfig[];
  creatable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  deletePath?: (id: number) => string;
  listLabel?: (item: Record<string, unknown>) => string;
}
