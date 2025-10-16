import * as fs from 'fs';
import * as path from 'path';
import clientConfig from '../src/config/clients.json';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

interface PropertyData {
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
}

interface EmbeddingData {
  content: string;
  embedding: number[];
  metadata: PropertyData;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function extractTextFromPDF(pdfPath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

      const data = new Uint8Array(fs.readFileSync(pdfPath));
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;

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
  });
}

function parsePropertiesFromText(text: string): PropertyData[] {
  const properties: PropertyData[] = [];

  const propertyPattern = /(?:Property|Project|Development|Building)[\s:]+([^\n]+)/gi;
  const matches = [...text.matchAll(propertyPattern)];

  if (matches.length === 0) {
    properties.push(createPropertyFromText(text, 'Property'));
  } else {
    for (const match of matches) {
      const name = match[1].trim();
      properties.push(createPropertyFromText(text, name));
    }
  }

  return properties;
}

function createPropertyFromText(text: string, name: string): PropertyData {
  return {
    name,
    type: extractPropertyType(text),
    description: text.substring(0, 500).trim(),
    price_range: extractPriceRange(text),
    size: extractSize(text),
    location: extractLocation(text),
    amenities: extractAmenities(text),
    bedrooms: extractBedrooms(text),
    price_min: extractMinPrice(text),
    price_max: extractMaxPrice(text),
  };
}

function extractPropertyType(text: string): string {
  const types = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Studio', 'Flat'];
  const lowerText = text.toLowerCase();

  for (const type of types) {
    if (lowerText.includes(type.toLowerCase())) {
      return type;
    }
  }
  return 'Apartment';
}

function extractPriceRange(text: string): string {
  const pricePattern = /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)\s*(?:L|Lakh|Cr|Crore)?/gi;
  const matches = [...text.matchAll(pricePattern)];

  if (matches.length > 0) {
    const prices = matches.slice(0, 2).map(m => m[0]);
    return prices.join(' - ');
  }
  return 'Price on request';
}

function extractSize(text: string): string {
  const sizePattern = /(\d+[\d,]*)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/gi;
  const match = text.match(sizePattern);
  return match ? match[0] : 'Size varies';
}

function extractLocation(text: string): string {
  const locations = [
    'Trivandrum', 'Thiruvananthapuram', 'Kerala',
    'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Jumeirah',
    'Palm Jumeirah', 'Dubai Hills', 'Mumbai', 'Bangalore', 'Delhi'
  ];

  const lowerText = text.toLowerCase();
  for (const location of locations) {
    if (lowerText.includes(location.toLowerCase())) {
      return location;
    }
  }
  return 'Location not specified';
}

function extractAmenities(text: string): string[] {
  const amenities: string[] = [];
  const lowerText = text.toLowerCase();

  const amenityKeywords = [
    { keyword: 'pool', value: 'Swimming Pool' },
    { keyword: 'gym', value: 'Gym' },
    { keyword: 'parking', value: 'Parking' },
    { keyword: 'security', value: '24/7 Security' },
    { keyword: 'clubhouse', value: 'Clubhouse' },
    { keyword: 'playground', value: 'Kids Play Area' },
    { keyword: 'pet', value: 'Pet Friendly' },
    { keyword: 'garden', value: 'Garden' },
    { keyword: 'lift', value: 'Elevator' },
  ];

  for (const { keyword, value } of amenityKeywords) {
    if (lowerText.includes(keyword)) {
      amenities.push(value);
    }
  }

  return amenities.length > 0 ? amenities : ['Security', 'Parking'];
}

function extractBedrooms(text: string): number {
  const bedroomPattern = /(\d+)\s*(?:BHK|bedroom|bed)/gi;
  const match = text.match(bedroomPattern);

  if (match) {
    const num = parseInt(match[0]);
    return isNaN(num) ? 2 : num;
  }
  return 2;
}

function extractMinPrice(text: string): number {
  const pricePattern = /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)\s*(L|Lakh|Cr|Crore)?/gi;
  const match = text.match(pricePattern);

  if (match) {
    const priceStr = match[0].replace(/[^\d.]/g, '');
    let price = parseFloat(priceStr);

    if (match[0].toLowerCase().includes('cr')) {
      price *= 10000000;
    } else if (match[0].toLowerCase().includes('l')) {
      price *= 100000;
    }

    return price;
  }
  return 1000000;
}

function extractMaxPrice(text: string): number {
  const minPrice = extractMinPrice(text);
  return minPrice * 1.5;
}

async function ingestPDF(clientName: string, projectName: string) {
  console.log(`\n🚀 Starting PDF ingestion for ${clientName}/${projectName}...`);

  const client = clientConfig.clients[clientName];
  if (!client) {
    throw new Error(`Client "${clientName}" not found in configuration`);
  }

  const project = client.projects[projectName];
  if (!project) {
    throw new Error(`Project "${projectName}" not found for client "${clientName}"`);
  }

  const pdfPath = path.join(process.cwd(), project.path);
  const embeddingsPath = path.join(process.cwd(), project.embeddingsPath);

  console.log(`📄 Reading PDF from: ${pdfPath}`);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found at: ${pdfPath}`);
  }

  console.log('📖 Extracting text from PDF...');
  const text = await extractTextFromPDF(pdfPath);
  console.log(`✓ Extracted ${text.length} characters`);

  console.log('🔍 Parsing properties from text...');
  const properties = parsePropertiesFromText(text);
  console.log(`✓ Found ${properties.length} properties`);

  const embeddings: EmbeddingData[] = [];

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    console.log(`\n📦 Processing property ${i + 1}/${properties.length}: ${property.name}`);

    const embeddingText = `${property.name} ${property.type} ${property.description} ${property.location} ${property.amenities.join(' ')}`;

    console.log('🧠 Generating embedding...');
    const embedding = await generateEmbedding(embeddingText);

    embeddings.push({
      content: embeddingText,
      embedding,
      metadata: property
    });

    console.log('✓ Embedding generated');
  }

  const embeddingsDir = path.dirname(embeddingsPath);
  if (!fs.existsSync(embeddingsDir)) {
    fs.mkdirSync(embeddingsDir, { recursive: true });
  }

  fs.writeFileSync(embeddingsPath, JSON.stringify(embeddings, null, 2));
  console.log(`\n✅ Embeddings saved to: ${embeddingsPath}`);
  console.log(`\n🎉 Ingestion complete! Processed ${properties.length} properties with ${embeddings.length} embeddings.`);
}

const clientName = clientConfig.currentClient;
const projectName = Object.keys(clientConfig.clients[clientName].projects)[0];

ingestPDF(clientName, projectName).catch(console.error);
