export const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date);
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const humanizeResourceKey = (key: string) =>
  key.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const toNumberOrNull = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

