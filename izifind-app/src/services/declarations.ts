import { http } from './http';
import type { Objet, Commissariat } from '@/types/api';

export interface DeclarationResult {
  message: string;
  objet: Objet;
  commissariat_recommande?: Commissariat | null;
}

export interface DeclarationLostPayload {
  categorie_id?: number | null;
  souscategorie_id?: number | null;
  description: string;
  date_action: string;
  lieu?: string;
  contact_phone?: string;
  contact_email?: string;
  montant_promesse?: number | null;
  photo_profil: { uri: string; name: string; type: string };
  photo_face: { uri: string; name: string; type: string };
  photo_derriere: { uri: string; name: string; type: string };
}

export interface DeclarationFoundPayload {
  categorie_id?: number | null;
  souscategorie_id?: number | null;
  description: string;
  date_action: string;
  lieu?: string;
  contact_phone?: string;
  contact_email?: string;
  latitude_user: number;
  longitude_user: number;
  photo_profil: { uri: string; name: string; type: string };
  photo_face: { uri: string; name: string; type: string };
  photo_derriere: { uri: string; name: string; type: string };
}

const appendOptional = (form: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return;
  }

  form.append(key, String(value));
};

export async function createLostDeclaration(payload: DeclarationLostPayload) {
  const form = new FormData();
  appendOptional(form, 'categorie_id', payload.categorie_id);
  appendOptional(form, 'souscategorie_id', payload.souscategorie_id);
  appendOptional(form, 'description', payload.description);
  appendOptional(form, 'date_action', payload.date_action);
  appendOptional(form, 'lieu', payload.lieu);
  appendOptional(form, 'contact_phone', payload.contact_phone);
  appendOptional(form, 'contact_email', payload.contact_email);
  appendOptional(form, 'montant_promesse', payload.montant_promesse);
  form.append('photo_profil', payload.photo_profil as any);
  form.append('photo_face', payload.photo_face as any);
  form.append('photo_derriere', payload.photo_derriere as any);

  const { data } = await http.post<DeclarationResult>('/declarations/perdu', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export async function createFoundDeclaration(payload: DeclarationFoundPayload) {
  const form = new FormData();
  appendOptional(form, 'categorie_id', payload.categorie_id);
  appendOptional(form, 'souscategorie_id', payload.souscategorie_id);
  appendOptional(form, 'description', payload.description);
  appendOptional(form, 'date_action', payload.date_action);
  appendOptional(form, 'lieu', payload.lieu);
  appendOptional(form, 'contact_phone', payload.contact_phone);
  appendOptional(form, 'contact_email', payload.contact_email);
  appendOptional(form, 'latitude_user', payload.latitude_user);
  appendOptional(form, 'longitude_user', payload.longitude_user);
  form.append('photo_profil', payload.photo_profil as any);
  form.append('photo_face', payload.photo_face as any);
  form.append('photo_derriere', payload.photo_derriere as any);

  const { data } = await http.post<DeclarationResult>('/declarations/trouve', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}
