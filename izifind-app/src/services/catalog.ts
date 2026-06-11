import { http } from './http';
import type {
  Category,
  Commissariat,
  Couleur,
  ImageObjet,
  Marque,
  Objet,
  Permission,
  Promesse,
  Role,
  SousCategorie,
  Statut,
  Temoignage,
  TitreObjet,
} from '@/types/api';

export async function getCategories() {
  const { data } = await http.get<Category[]>('/categories');
  return data;
}

export async function getSousCategories() {
  const { data } = await http.get<SousCategorie[]>('/sous-categories');
  return data;
}

export async function getSousCategoriesByCategorie(categorieId: number) {
  const { data } = await http.get<SousCategorie[]>(`/sous-categories/par-categorie/${categorieId}`);
  return data;
}

export async function getMarques() {
  const { data } = await http.get<Marque[]>('/marques');
  return data;
}

export async function getMarquesBySousCategorie(souscategorieId: number) {
  const { data } = await http.get<Marque[]>(`/marques/par-souscategorie/${souscategorieId}`);
  return data;
}

export async function getCouleurs() {
  const { data } = await http.get<Couleur[]>('/couleurs');
  return data;
}

export async function getStatuts() {
  const { data } = await http.get<Statut[]>('/statuts');
  return data;
}

export async function getTitres() {
  const { data } = await http.get<TitreObjet[]>('/titres-objets');
  return data;
}

export async function getCommissariats() {
  const { data } = await http.get<Commissariat[]>('/commissariats');
  return data;
}

export async function getObjects(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await http.get<Objet[]>('/objets', { params });
  return data;
}

export async function getObjectById(id: number) {
  const { data } = await http.get<Objet>(`/objets/${id}`);
  return data;
}

export async function getImages() {
  const { data } = await http.get<ImageObjet[]>('/images');
  return data;
}

export async function getModifications() {
  const { data } = await http.get('/modifications');
  return data;
}

export async function getPromesses() {
  const { data } = await http.get<Promesse[]>('/promesses');
  return data;
}

export async function getTemoignages() {
  const { data } = await http.get<Temoignage[]>('/temoignages');
  return data;
}

export async function getPermissions() {
  const { data } = await http.get<Permission[]>('/rbac/permissions');
  return data;
}

export async function getRoles() {
  const { data } = await http.get<Role[]>('/rbac/roles');
  return data;
}

export async function getStatistics() {
  const { data } = await http.get<{ perdus: number; trouves: number; postes: number }>('/statistiques');
  return data;
}
