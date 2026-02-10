const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function getImageUrl(path: string | null, size: 'w500' | 'original' | 'w1280' = 'w500') {
  if (!path) return '/placeholder.png';
  return `${IMAGE_BASE_URL}${size}${path}`;
}
