import { Property, UserPreferences } from '../types';
import { generateEmbedding } from './openai';
import clientConfig from '../config/clients.json';

interface EmbeddingData {
  content: string;
  embedding: number[];
  metadata: {
    name: string;
    type: string;
    description: string;
    price_range: string;
    size: string;
    location: string;
    amenities: string[];
    bedrooms: number;
    price_min: number;
    price_max: number;
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function searchEmbeddings(preferences: UserPreferences): Promise<Property[]> {
  try {
    const client = clientConfig.clients[clientConfig.currentClient];
    const project = Object.values(client.projects)[0];
    const projectLink = project.link;

    const embeddingsPath = project.embeddingsPath;
    const response = await fetch(`/${embeddingsPath}`);

    if (!response.ok) {
      console.log('Embeddings file not found, using mock data');
      return [];
    }

    const embeddings: EmbeddingData[] = await response.json();

    const queryText = buildQueryText(preferences);
    const queryEmbedding = await generateEmbedding(queryText);

    const results = embeddings.map(item => ({
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
      data: item
    }));

    results.sort((a, b) => b.similarity - a.similarity);

    const topResults = results.slice(0, 10);

    const properties: Property[] = topResults
      .filter(result => result.similarity > 0.3)
      .map(result => {
        const metadata = result.data.metadata;
        return {
          id: `emb-${Math.random().toString(36).substr(2, 9)}`,
          name: metadata.name,
          type: metadata.type,
          image_url: getPropertyImage(metadata.type),
          price_range: metadata.price_range,
          size: metadata.size,
          location: metadata.location,
          amenities: metadata.amenities,
          link: projectLink,
          description: metadata.description,
          metadata: {
            bedrooms: metadata.bedrooms,
            price_min: metadata.price_min,
            price_max: metadata.price_max,
          }
        };
      });

    return applyFilters(properties, preferences);
  } catch (error) {
    console.error('Embedding search error:', error);
    return [];
  }
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
  if (preferences.location && preferences.location !== 'No Preference') {
    parts.push(`in ${preferences.location}`);
  }
  if (preferences.budgetMin && preferences.budgetMax) {
    parts.push(`budget ${preferences.budgetMin} to ${preferences.budgetMax}`);
  }
  if (preferences.amenities && preferences.amenities.length > 0) {
    parts.push(`with ${preferences.amenities.join(', ')}`);
  }
  if (preferences.near && preferences.near.length > 0) {
    parts.push(`near ${preferences.near.join(', ')}`);
  }

  return parts.join(' ') || 'property';
}

function applyFilters(properties: Property[], preferences: UserPreferences): Property[] {
  return properties.filter((property) => {
    if (preferences.propertyType && property.type !== preferences.propertyType) {
      return false;
    }

    if (preferences.location && preferences.location !== 'No Preference') {
      if (!property.location.toLowerCase().includes(preferences.location.toLowerCase())) {
        return false;
      }
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

    return true;
  });
}

function getPropertyImage(type: string): string {
  const images: Record<string, string> = {
    'Apartment': 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Flat': 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Villa': 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Penthouse': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Townhouse': 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Studio': 'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800',
  };
  return images[type] || images['Apartment'];
}
