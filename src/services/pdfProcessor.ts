import { insertPropertyFromPDF } from './propertySearch';

export async function processPDFUpload(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await extractTextFromPDF(file);
    const properties = parsePropertiesFromText(text);

    let successCount = 0;
    for (const propertyData of properties) {
      const result = await insertPropertyFromPDF(propertyData);
      if (result) successCount++;
    }

    return {
      success: true,
      message: `Successfully processed ${successCount} properties from PDF.`,
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    return {
      success: false,
      message: 'Failed to process PDF. Please ensure the file contains property information.',
    };
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);

      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error('PDF.js library not loaded'));
          return;
        }

        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }

        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parsePropertiesFromText(text: string) {
  const properties = [];

  const propertyPattern = /(?:Property|Project|Development)[\s:]+([^\n]+)/gi;
  const matches = text.matchAll(propertyPattern);

  for (const match of matches) {
    const name = match[1].trim();

    const property = {
      name,
      type: extractPropertyType(text, name),
      description: extractDescription(text, name),
      price_range: extractPriceRange(text, name),
      size: extractSize(text, name),
      location: extractLocation(text, name),
      amenities: extractAmenities(text),
      metadata: {
        bedrooms: extractBedrooms(text, name),
        price_min: extractMinPrice(text, name),
        price_max: extractMaxPrice(text, name),
      },
    };

    properties.push(property);
  }

  if (properties.length === 0) {
    properties.push({
      name: 'Extracted Property',
      type: extractPropertyType(text, ''),
      description: text.substring(0, 500),
      price_range: extractPriceRange(text, ''),
      size: extractSize(text, ''),
      location: extractLocation(text, ''),
      amenities: extractAmenities(text),
      metadata: {
        bedrooms: extractBedrooms(text, ''),
        price_min: extractMinPrice(text, ''),
        price_max: extractMaxPrice(text, ''),
      },
    });
  }

  return properties;
}

function extractPropertyType(text: string, context: string): string {
  const types = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Studio'];
  const lowerText = (context + ' ' + text).toLowerCase();

  for (const type of types) {
    if (lowerText.includes(type.toLowerCase())) {
      return type;
    }
  }
  return 'Apartment';
}

function extractDescription(text: string, propertyName: string): string {
  const index = text.toLowerCase().indexOf(propertyName.toLowerCase());
  if (index === -1) return text.substring(0, 200);

  const snippet = text.substring(index, index + 300);
  return snippet.trim();
}

function extractPriceRange(text: string, context: string): string {
  const pricePattern = /AED\s*([\d,]+(?:\.\d+)?)\s*(?:M|Million|K|Thousand)?/gi;
  const matches = [...text.matchAll(pricePattern)];

  if (matches.length > 0) {
    const prices = matches.map(m => m[0]).slice(0, 2);
    return prices.join(' - ');
  }
  return 'Price on request';
}

function extractSize(text: string, context: string): string {
  const sizePattern = /(\d+[\d,]*)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/gi;
  const match = text.match(sizePattern);

  if (match) {
    return match[0];
  }
  return 'Size varies';
}

function extractLocation(text: string, context: string): string {
  const locations = [
    'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Jumeirah',
    'Palm Jumeirah', 'Dubai Hills', 'JBR', 'Arabian Ranches', 'JLT'
  ];

  const lowerText = text.toLowerCase();
  for (const location of locations) {
    if (lowerText.includes(location.toLowerCase())) {
      return location;
    }
  }
  return 'Dubai';
}

function extractAmenities(text: string): string[] {
  const amenities = [];
  const lowerText = text.toLowerCase();

  const amenityKeywords = [
    { keyword: 'pool', value: 'Swimming Pool' },
    { keyword: 'gym', value: 'Gym' },
    { keyword: 'parking', value: 'Parking' },
    { keyword: 'security', value: '24/7 Security' },
    { keyword: 'clubhouse', value: 'Clubhouse' },
    { keyword: 'playground', value: 'Kids Play Area' },
    { keyword: 'pet', value: 'Pet Friendly' },
  ];

  for (const { keyword, value } of amenityKeywords) {
    if (lowerText.includes(keyword)) {
      amenities.push(value);
    }
  }

  return amenities;
}

function extractBedrooms(text: string, context: string): number {
  const bedroomPattern = /(\d+)\s*(?:BHK|bedroom|bed)/gi;
  const match = text.match(bedroomPattern);

  if (match) {
    const num = parseInt(match[0]);
    return isNaN(num) ? 2 : num;
  }
  return 2;
}

function extractMinPrice(text: string, context: string): number {
  const pricePattern = /AED\s*([\d,]+(?:\.\d+)?)\s*(M|Million|K|Thousand)?/gi;
  const match = text.match(pricePattern);

  if (match) {
    const priceStr = match[0].replace(/[^\d.]/g, '');
    let price = parseFloat(priceStr);

    if (match[0].toLowerCase().includes('m')) {
      price *= 1000000;
    } else if (match[0].toLowerCase().includes('k')) {
      price *= 1000;
    }

    return price;
  }
  return 500000;
}

function extractMaxPrice(text: string, context: string): number {
  const minPrice = extractMinPrice(text, context);
  return minPrice * 2;
}
