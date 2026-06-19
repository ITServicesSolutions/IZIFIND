import { Share } from 'react-native';
import type { Objet } from '@/types/api';

export function objectShareUrl(objet: Objet) {
  const baseUrl = process.env.EXPO_PUBLIC_SHARE_BASE_URL?.replace(/\/$/, '');
  return baseUrl ? `${baseUrl}/object/${objet.id}` : undefined;
}

export async function shareObject(objet: Objet) {
  const url = objectShareUrl(objet);
  const lines = [
    `IZIFIND - ${objet.description}`,
    objet.lieu ? `Lieu: ${objet.lieu}` : undefined,
    url,
  ].filter(Boolean);

  await Share.share({ message: lines.join('\n') });
}
