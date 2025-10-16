/*
  # Add vector similarity search function

  1. Functions
    - `match_properties` - Performs vector similarity search on document embeddings
      - Takes query embedding, match threshold, and count as parameters
      - Returns properties ordered by similarity score
      
  2. Purpose
    - Enable semantic search for properties based on user preferences
    - Use cosine similarity to find closest matching properties
*/

CREATE OR REPLACE FUNCTION match_properties(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  image_url text,
  price_range text,
  size text,
  location text,
  amenities text[],
  link text,
  description text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.type,
    p.image_url,
    p.price_range,
    p.size,
    p.location,
    p.amenities,
    p.link,
    p.description,
    p.metadata,
    1 - (de.embedding <=> query_embedding) as similarity
  FROM properties p
  INNER JOIN document_embeddings de ON p.id = de.property_id
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;