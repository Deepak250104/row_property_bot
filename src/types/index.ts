export interface Property {
  id: string;
  name: string;
  type: string;
  image_url: string;
  images?: string[];
  price_range: string;
  size: string;
  location: string;
  amenities: string[];
  link: string;
  description: string;
  metadata?: {
    bedrooms?: number;
    price_min?: number;
    price_max?: number;
    size_sqft?: number;
    near?: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  buttons?: ButtonOption[];
  timestamp: Date;
}

export interface ButtonOption {
  label: string;
  value: string;
  icon?: string;
  multiSelect?: boolean;
}

export interface UserPreferences {
  propertyType?: string;
  size?: string;
  bedrooms?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  near?: string[];
  amenities?: string[];
}

export type SortOption = 'relevance' | 'price' | 'size';
