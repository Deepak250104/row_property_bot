import { Property, UserPreferences } from '../types';

// Enable mock data for demo
export const ENABLE_MOCK_DATA = true;

export function generateMockProperties(preferences: UserPreferences): Property[] {
  // Demo dataset: 3 Dubai Hills projects
  const dataset: Property[] = [
    {
      id: 'rosehill',
      name: 'Rosehill',
      type: 'Apartment',
      image_url: 'https://images.bayut.com/thumbnails/798953965-800x600.webp',
      images: [
        'https://images.bayut.com/thumbnails/798953965-800x600.webp',
        'https://images.bayut.com/thumbnails/798927716-800x600.webp',
        'https://images.bayut.com/thumbnails/798927710-800x600.webp',
        'https://images.bayut.com/thumbnails/798927717-800x600.webp',
      ],
      price_range: 'AED 2,310,000',
      size: '1,419 sqft',
      location: 'Dubai Hills',
      amenities: [
        'Furnished',
        'Electricity Backup',
        'Parking Spaces: 2',
        'Gym or Health Club',
        'Swimming Pool',
      ],
      link: 'https://www.bayut.com/property/details-13038073.html',
      description: '2BHK apartment in Dubai Hills with premium amenities.',
      metadata: {
        bedrooms: 2,
        price_min: 2310000,
        price_max: 2310000,
        size_sqft: 1419,
        near: ['School', 'Mall', 'Office'],
      },
    },
    {
      id: 'acacia',
      name: 'Acacia',
      type: 'Apartment',
      image_url: 'https://images.bayut.com/thumbnails/797218561-800x600.webp',
      images: [
        'https://images.bayut.com/thumbnails/797218561-800x600.webp',
        'https://images.bayut.com/thumbnails/798217923-800x600.webp',
        'https://images.bayut.com/thumbnails/798217929-800x600.webp',
        'https://images.bayut.com/thumbnails/797218570-800x600.webp',
      ],
      price_range: 'AED 3,850,000',
      size: '1,322 sqft',
      location: 'Dubai Hills',
      amenities: ['Swimming Pool', 'Gym or Health Club', 'Security Staff'],
      link: 'https://www.bayut.com/property/details-12941480.html',
      description: 'Modern 2BHK apartment in Acacia, Dubai Hills.',
      metadata: {
        bedrooms: 2,
        price_min: 3850000,
        price_max: 3850000,
        size_sqft: 1322,
        near: ['School', 'Mall', 'Office'],
      },
    },
    {
      id: 'executive-residences',
      name: 'Executive Residences',
      type: 'Apartment',
      image_url: 'https://images.bayut.com/thumbnails/797766113-800x600.webp',
      images: [
        'https://images.bayut.com/thumbnails/797766113-800x600.webp',
        'https://images.bayut.com/thumbnails/797766118-800x600.webp',
        'https://images.bayut.com/thumbnails/797766122-800x600.webp',
        'https://images.bayut.com/thumbnails/797766134-800x600.webp',
        'https://images.bayut.com/thumbnails/797766136-800x600.webp',
      ],
      price_range: 'AED 4,100,000',
      size: '1,277 sqft',
      location: 'Dubai Hills',
      amenities: ['Swimming Pool', 'Gym or Health Club', 'Security Staff'],
      link: 'https://www.bayut.com/property/details-12971676.html',
      description: 'Elegant 2BHK at Executive Residences, Dubai Hills.',
      metadata: {
        bedrooms: 2,
        price_min: 4100000,
        price_max: 4100000,
        size_sqft: 1277,
        near: ['School', 'Mall', 'Office'],
      },
    },
  ];

  return applyFilters(dataset, preferences);
}

function applyFilters(properties: Property[], preferences: UserPreferences): Property[] {
  return properties.filter((property) => {
    // Property type
    if (preferences.propertyType && property.type.toLowerCase() !== preferences.propertyType.toLowerCase()) {
      return false;
    }

    // Location
    if (preferences.location && preferences.location !== 'No Preference') {
      if (property.location.toLowerCase() !== preferences.location.toLowerCase()) return false;
    }

    // Bedrooms
    if (preferences.bedrooms && property.metadata?.bedrooms != null) {
      const prefBedrooms = parseInt(preferences.bedrooms) || (preferences.bedrooms === '4+ BHK' ? 4 : undefined);
      if (prefBedrooms && property.metadata.bedrooms !== prefBedrooms) return false;
    }

    // Budget
    if (preferences.budgetMin && preferences.budgetMax && property.metadata?.price_min != null) {
      if (property.metadata.price_min > preferences.budgetMax || property.metadata.price_max! < preferences.budgetMin) {
        return false;
      }
    }

    // Size range like "1200-1800"
    if (preferences.size && property.metadata?.size_sqft) {
      const [minStr, maxStr] = preferences.size.split('-');
      const min = parseInt(minStr);
      const max = parseInt(maxStr);
      if (!isNaN(min) && !isNaN(max)) {
        if (property.metadata.size_sqft < min || property.metadata.size_sqft > max) return false;
      }
    }

    // Amenities must include all selected
    if (preferences.amenities && preferences.amenities.length > 0) {
      const hasAll = preferences.amenities.every((a) =>
        property.amenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
      );
      if (!hasAll) return false;
    }

    // Near filters must all be satisfied
    if (preferences.near && preferences.near.length > 0) {
      const near = property.metadata?.near || [];
      const hasAllNear = preferences.near.every((n) =>
        near.some((pn) => pn.toLowerCase().includes(n.toLowerCase()))
      );
      if (!hasAllNear) return false;
    }

    return true;
  });
}
