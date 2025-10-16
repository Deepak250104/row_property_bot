import { ButtonOption, UserPreferences } from '../types';

interface ConversationStep {
  message: string;
  buttons?: ButtonOption[];
}

export const conversationFlow = {
  greeting: {
    message: "👋 Hi! Welcome to Dubai Property Assistant.\nHow can I help you today?",
    buttons: [
      { label: '🏠 Property Inquiry', value: 'property_inquiry' },
      { label: '💰 Loan Inquiry', value: 'loan_inquiry' },
      { label: '📄 Document Assistance', value: 'document_assistance' },
      { label: '📞 Contact Sales', value: 'contact_sales' },
    ],
  },

  property_type: {
    message: "What type of property are you looking for?",
    buttons: [
      { label: 'Apartment / Flat', value: 'Apartment' },
      { label: 'Villa', value: 'Villa' },
      { label: 'Penthouse', value: 'Penthouse' },
      { label: 'Townhouse', value: 'Townhouse' },
      { label: 'Studio', value: 'Studio' },
      { label: 'Individual House', value: 'House' },
    ],
  },

  size: {
    message: "What's your preferred property size?",
    buttons: [
      { label: '500–800 sq ft', value: '500-800' },
      { label: '800–1200 sq ft', value: '800-1200' },
      { label: '1200–1800 sq ft', value: '1200-1800' },
      { label: '1800–2500 sq ft', value: '1800-2500' },
      { label: '2500+ sq ft', value: '2500+' },
    ],
  },

  bedrooms: {
    message: "How many bedrooms would you prefer?",
    buttons: [
      { label: '1 BHK', value: '1 BHK' },
      { label: '2 BHK', value: '2 BHK' },
      { label: '3 BHK', value: '3 BHK' },
      { label: '4+ BHK', value: '4+ BHK' },
    ],
  },

  location: {
    message: "Which location would you prefer?",
    buttons: [
      { label: 'Dubai Marina', value: 'Dubai Marina' },
      { label: 'Downtown Dubai', value: 'Downtown Dubai' },
      { label: 'Business Bay', value: 'Business Bay' },
      { label: 'Jumeirah', value: 'Jumeirah' },
      { label: 'Palm Jumeirah', value: 'Palm Jumeirah' },
      { label: 'Dubai Hills', value: 'Dubai Hills' },
      { label: '🌀 No Preference', value: 'No Preference' },
    ],
  },

  budget: {
    message: "What's your budget range?",
    buttons: [
      { label: 'AED 500K – 1M', value: '500000-1000000' },
      { label: 'AED 1M – 2M', value: '1000000-2000000' },
      { label: 'AED 2M – 5M', value: '2000000-5000000' },
      { label: 'AED 5M – 10M', value: '5000000-10000000' },
      { label: 'AED 10M+', value: '10000000+' },
    ],
  },

  near: {
    message: "Do you want your property near any of these?\n(Select all that apply)",
    buttons: [
      { label: '🏫 School', value: 'School', multiSelect: true },
      { label: '🏥 Hospital', value: 'Hospital', multiSelect: true },
      { label: '🛒 Mall / Supermarket', value: 'Mall', multiSelect: true },
      { label: '🚇 Metro Station', value: 'Metro', multiSelect: true },
      { label: '🌳 Park', value: 'Park', multiSelect: true },
      { label: '🏢 Office Area', value: 'Office', multiSelect: true },
    ],
  },

  amenities: {
    message: "Which amenities would you like?\n(Select all that apply)",
    buttons: [
      { label: '🏊 Swimming Pool', value: 'Pool', multiSelect: true },
      { label: '🏋️ Gym', value: 'Gym', multiSelect: true },
      { label: '🏠 Clubhouse', value: 'Clubhouse', multiSelect: true },
      { label: '🧒 Kids Play Area', value: 'Kids Play Area', multiSelect: true },
      { label: '🚗 Parking', value: 'Parking', multiSelect: true },
      { label: '🔐 Security', value: 'Security', multiSelect: true },
      { label: '🐕 Pet Friendly', value: 'Pet Friendly', multiSelect: true },
    ],
  },

  processResponse(step: string, value: string, currentPrefs: UserPreferences) {
    const preferences = { ...currentPrefs };

    if (step === 'greeting') {
      if (value === 'property_inquiry') {
        return { step: 'property_type', preferences };
      }
      return { step: 'greeting', preferences };
    }

    if (step === 'property_type') {
      preferences.propertyType = value;
      return { step: 'size', preferences };
    }

    if (step === 'size') {
      preferences.size = value;
      return { step: 'bedrooms', preferences };
    }

    if (step === 'bedrooms') {
      preferences.bedrooms = value;
      return { step: 'location', preferences };
    }

    if (step === 'location') {
      preferences.location = value;
      return { step: 'budget', preferences };
    }

    if (step === 'budget') {
      const [min, max] = value.split('-').map(Number);
      preferences.budgetMin = min;
      preferences.budgetMax = max || 999999999;
      return { step: 'near', preferences };
    }

    if (step === 'summary_choice') {
      if (value === 'search') {
        return { step: 'search', preferences };
      }
      if (value === 'restart') {
        return { step: 'greeting', preferences: {} };
      }
    }

    return { step, preferences };
  },

  getNextStep(currentStep: string) {
    if (currentStep === 'near') {
      return { step: 'amenities' };
    }
    if (currentStep === 'amenities') {
      // For demo: go straight to search results after amenities
      return { step: 'search' };
    }
    return { step: currentStep };
  },

  summary(preferences: UserPreferences) {
    const parts = [
      "Perfect! Here's what you're looking for:\n",
      `Property: ${preferences.propertyType || 'Any'}`,
      `Size: ${preferences.size || 'Any'}`,
      `Bedrooms: ${preferences.bedrooms || 'Any'}`,
      `Location: ${preferences.location || 'Any'}`,
      `Budget: AED ${preferences.budgetMin?.toLocaleString()} - ${preferences.budgetMax?.toLocaleString() || 'No limit'}`,
    ];

    if (preferences.near && preferences.near.length > 0) {
      parts.push(`Near: ${preferences.near.join(', ')}`);
    }

    if (preferences.amenities && preferences.amenities.length > 0) {
      parts.push(`Amenities: ${preferences.amenities.join(', ')}`);
    }

    return parts.join('\n');
  },
};
