import { supabase } from '../lib/supabase';
import { generateEmbedding } from './openai';
import { Property, UserPreferences } from '../types';

export async function searchProperties(preferences: UserPreferences): Promise<Property[]> {
  const queryText = buildQueryText(preferences);
  const embedding = await generateEmbedding(queryText);

  const { data, error } = await supabase.rpc('match_properties', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 20,
  });

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  let results = data || [];

  results = applyFilters(results, preferences);

  return results;
}

function buildQueryText(preferences: UserPreferences): string {
  const parts: string[] = [];

  if (preferences.propertyType) {
    parts.push(`${preferences.propertyType} property`);
  }
  if (preferences.bedrooms) {
    parts.push(`${preferences.bedrooms} bedrooms`);
  }
  if (preferences.size) {
    parts.push(`size ${preferences.size}`);
  }
  if (preferences.location) {
    parts.push(`in ${preferences.location}`);
  }
  if (preferences.budgetMin && preferences.budgetMax) {
    parts.push(`budget AED ${preferences.budgetMin} to ${preferences.budgetMax}`);
  }
  if (preferences.amenities && preferences.amenities.length > 0) {
    parts.push(`with ${preferences.amenities.join(', ')}`);
  }
  if (preferences.near && preferences.near.length > 0) {
    parts.push(`near ${preferences.near.join(', ')}`);
  }

  return parts.join(' ') || 'property in Dubai';
}

function applyFilters(properties: Property[], preferences: UserPreferences): Property[] {
  return properties.filter((property) => {
    if (preferences.propertyType && property.type !== preferences.propertyType) {
      return false;
    }

    if (preferences.location && preferences.location !== 'No Preference' && property.location !== preferences.location) {
      return false;
    }

    if (preferences.bedrooms && property.metadata?.bedrooms) {
      const bedroomMatch = preferences.bedrooms === '4+ BHK'
        ? property.metadata.bedrooms >= 4
        : property.metadata.bedrooms === parseInt(preferences.bedrooms);
      if (!bedroomMatch) return false;
    }

    if (preferences.budgetMin && preferences.budgetMax && property.metadata?.price_min) {
      if (property.metadata.price_min > preferences.budgetMax ||
          (property.metadata.price_max && property.metadata.price_max < preferences.budgetMin)) {
        return false;
      }
    }

    if (preferences.amenities && preferences.amenities.length > 0) {
      const hasAllAmenities = preferences.amenities.every(amenity =>
        property.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });
}

export async function insertPropertyFromPDF(propertyData: {
  name: string;
  type: string;
  description: string;
  price_range: string;
  size: string;
  location: string;
  amenities: string[];
  metadata?: any;
}): Promise<Property | null> {
  const embeddingText = `${propertyData.name} ${propertyData.type} ${propertyData.description} ${propertyData.location}`;
  const embedding = await generateEmbedding(embeddingText);

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({
      name: propertyData.name,
      type: propertyData.type,
      description: propertyData.description,
      price_range: propertyData.price_range,
      size: propertyData.size,
      location: propertyData.location,
      amenities: propertyData.amenities,
      image_url: '',
      link: '',
      metadata: propertyData.metadata || {},
    })
    .select()
    .single();

  if (propertyError) {
    console.error('Error inserting property:', propertyError);
    return null;
  }

  const { error: embeddingError } = await supabase
    .from('document_embeddings')
    .insert({
      property_id: property.id,
      content: embeddingText,
      embedding: embedding,
      metadata: { source: 'pdf_upload' },
    });

  if (embeddingError) {
    console.error('Error inserting embedding:', embeddingError);
  }

  return property as Property;
}
