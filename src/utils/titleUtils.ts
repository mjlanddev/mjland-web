export function parseAnimeTitle(title: string | null | undefined): { cleanTitle: string; tag: string | null } {
  if (!title || title.trim() === '') return { cleanTitle: 'Unknown', tag: null };

  const pattern = /([-:]?\s*(season\s*\d+|season\s*[ivx]+|part\s*\d+|part\s*[ivx]+|part\s*two|final season|finale|cour\s*\d+))+\s*$/i;
  const match = title.match(pattern);

  if (match && match.index !== undefined) {
    const tag = match[0].replace(/^[-:\s]+/, '').trim();
    const cleanTitle = title.substring(0, match.index).replace(/[-:\s]+$/, '').trim();

    if (cleanTitle.length > 0) {
      return { cleanTitle, tag: tag.toUpperCase() };
    }
  }

  return { cleanTitle: title, tag: null };
}
