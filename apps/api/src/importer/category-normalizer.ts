const KNOWN_CATEGORIES: Record<string, string> = {
  BIOLOGIA: 'Biologia',
  FISICA: 'Física',
  GEOGRAFIA: 'Geografia',
  HISTORIA: 'História',
  INGLES: 'Inglês',
  MATEMATICA: 'Matemática',
  MULTIDISCIPLINAR: 'Multidisciplinar',
  PORTUGUES: 'Português',
  QUIMICA: 'Química',
  RACIOCINIO_LOGICO: 'Raciocínio Lógico',
};

export function categoryKey(category: string): string {
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function normalizeCategoryName(category: string): string {
  const key = categoryKey(category);
  if (KNOWN_CATEGORIES[key]) return KNOWN_CATEGORIES[key];

  const compactKey = key.replace(/_/g, '');
  const fuzzyEntry = Object.entries(KNOWN_CATEGORIES).find(([knownKey]) => compactKey.startsWith(knownKey.replace(/_/g, '')));
  if (fuzzyEntry) return fuzzyEntry[1];

  return category
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('pt-BR'));
}
