import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
};
