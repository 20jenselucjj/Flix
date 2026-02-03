-- Create table for caching media metadata
CREATE TABLE IF NOT EXISTS media_cache (
    tmdb_id INTEGER NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('movie', 'tv')),
    metadata JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (tmdb_id, type)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_cache_updated ON media_cache(last_updated);

-- Enable RLS
ALTER TABLE media_cache ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON media_cache TO service_role;
GRANT SELECT ON media_cache TO anon;
GRANT SELECT ON media_cache TO authenticated;

-- Create policy for reading (public can read)
CREATE POLICY "Public profiles are viewable by everyone." ON media_cache FOR SELECT USING (true);
