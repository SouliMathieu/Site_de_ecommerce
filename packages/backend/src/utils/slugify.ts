/**
 * Convertit une chaîne de caractères en slug URL-friendly
 * Gère les caractères spéciaux français et arabes
 */
export default function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Évite les tirets multiples
    .trim()
    .toLowerCase()
    .substring(0, 200) + '-' + Date.now().toString(36); // Ajoute un suffixe pour l'unicité
}