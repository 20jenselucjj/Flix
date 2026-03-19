import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_CORS_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://myflix3.vercel.app',
];

const parseAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins && configuredOrigins.length > 0
    ? configuredOrigins
    : DEFAULT_CORS_ALLOWED_ORIGINS;
};

export const CONFIG = {
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  CORS_ALLOWED_ORIGINS: parseAllowedOrigins(),
};
