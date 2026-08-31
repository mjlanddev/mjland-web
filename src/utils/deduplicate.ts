import { Movie } from '../types';

export const deduplicateRows = (rows: Movie[][]): Movie[][] => {
  const seenIds = new Set<number>();
  
  return rows.map(row => {
    const filtered = row.filter(movie => !seenIds.has(movie.id));

    const finalRow = filtered.length >= 8 ? filtered : row;
    
    finalRow.forEach(movie => seenIds.add(movie.id));
    return finalRow;
  });
};
