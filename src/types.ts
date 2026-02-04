export interface Media {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  certification?: string;
  genre_ids?: number[];
}

export interface MediaDetails extends Media {
  genres: { id: number; name: string }[];
  runtime?: number;
  certification?: string;
  episode_run_time?: number[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos: {
    results: {
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  similar: {
    results: Media[];
  };
  recommendations?: {
    results: Media[];
  };
  seasons?: Season[];
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number;
  vote_average: number;
}

export interface StreamSource {
  quality: string;
  url: string;
  source: string;
  type?: 'mp4' | 'embed';
}

export interface Genre {
  id: number;
  name: string;
}

export interface ShortItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  media_type: 'movie';
  videoId: string;
  genre_ids?: number[];
}
