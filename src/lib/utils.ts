const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

export function getImageUrl(path: string | null, size: 'w500' | 'original' | 'w1280' = 'w500') {
  if (!path) return '/placeholder.png';
  return `${IMAGE_BASE_URL}${size}${path}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function getDisplayYear(date?: string) {
  return date?.slice(0, 4);
}

export function getMediaLabel(type?: 'movie' | 'tv') {
  if (type === 'tv') return 'Series';
  if (type === 'movie') return 'Movie';
  return undefined;
}

export function getGenreLabels(genreIds?: number[], limit = 2) {
  if (!genreIds?.length) return [];

  return genreIds
    .map((genreId) => GENRE_MAP[genreId])
    .filter((genre): genre is string => Boolean(genre))
    .slice(0, limit);
}
