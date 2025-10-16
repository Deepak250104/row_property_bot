# Dubai Real Estate Chatbot - Setup Instructions

## Overview
This is a production-ready AI-powered real estate recommendation chatbot for Dubai properties. It features:
- ChatGPT-style floating chat widget
- Button-based guided conversation flow
- Voice input (speech-to-text)
- PDF upload for property data
- AI-powered semantic search using OpenAI embeddings
- Elegant gold-on-black design theme

## Prerequisites
1. OpenAI API Key (for embeddings, chat, and speech-to-text)
2. Supabase project (already configured)

## Setup Steps

### 1. Add Your OpenAI API Key
Open the `.env` file and replace `your_openai_api_key_here` with your actual OpenAI API key:

```
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173`

## How to Use

### Adding Properties via PDF

1. Click the **Upload button** (📎) in the chat widget
2. Select a PDF containing property information
3. The system will automatically:
   - Extract text from the PDF
   - Parse property details (name, type, price, location, amenities)
   - Generate embeddings using OpenAI
   - Store in Supabase database

**PDF Format Tips:**
- Include property names, types (Apartment, Villa, etc.)
- Mention prices (e.g., "AED 1.5M" or "AED 1,500,000")
- Specify sizes (e.g., "1200 sq ft")
- List locations (Dubai Marina, Downtown Dubai, etc.)
- Include amenities (pool, gym, parking, etc.)

### Manually Adding Properties

You can also add properties directly to the database. Here's an example:

```javascript
// Example property data structure
const property = {
  name: "Ocean View Residences",
  type: "Apartment",
  description: "Luxury 2 BHK apartment with stunning ocean views",
  price_range: "AED 1.8M - 2.2M",
  size: "1200 sq ft",
  location: "Downtown Dubai",
  amenities: ["Swimming Pool", "Gym", "Security", "Parking"],
  image_url: "https://example.com/image.jpg",  // ← Add property image URL here
  link: "https://builder-website.com/property",  // ← Add property details page URL here
  metadata: {
    bedrooms: 2,
    price_min: 1800000,
    price_max: 2200000,
    size_sqft: 1200,
    near: ["Metro", "Mall", "School"]
  }
};
```

**Where to Add Links and Images:**

1. **Property Image (`image_url`)**:
   - Add direct URL to property image
   - Recommended size: 800x600px or larger
   - Formats: JPG, PNG, WebP

2. **Property Details Link (`link`)**:
   - Add URL to the full property listing on your website
   - When users click "View Details" button, they'll be redirected here
   - Example: `https://yourbuildersite.com/properties/ocean-view-residences`

3. **Contact Sales Button**:
   - Currently shows as a button in PropertyCard.tsx
   - To customize: Edit `/src/components/PropertyCard.tsx` line ~67
   - You can make it open a contact form, WhatsApp, or phone number

### Using the Chatbot

1. Click the floating **chat icon** (bottom-right corner)
2. Select "Property Inquiry"
3. Answer questions by clicking buttons:
   - Property type (Apartment, Villa, etc.)
   - Size preference
   - Number of bedrooms
   - Location
   - Budget range
   - Nearby facilities (multi-select)
   - Amenities (multi-select)
4. Review your preferences summary
5. Click "Search Properties" to see results

### Voice Input

1. Click the **microphone icon** in the chat input
2. Allow browser microphone access
3. Speak your query
4. Click the icon again to stop recording
5. Your speech will be transcribed to text automatically

## Customization Guide

### Changing Colors

The design uses gold (#D4AF37) and black (#000000). To change:

1. **Primary Accent (Gold)**:
   - Find and replace `yellow-600` and `yellow-500` in all component files
   - Or edit Tailwind config for global change

2. **Background**:
   - Edit `bg-black` and `bg-zinc-900` classes

### Modifying Conversation Flow

Edit `/src/utils/conversationFlow.ts` to:
- Add/remove questions
- Change button options
- Modify the conversation sequence

### Property Card Layout

Edit `/src/components/PropertyCard.tsx` to customize:
- Card design and layout
- Information displayed
- Button actions
- Hover effects

### Search Algorithm

Edit `/src/services/propertySearch.ts` to:
- Adjust similarity threshold (currently 0.5)
- Modify filter logic
- Change result ranking

## Database Structure

### Properties Table
- `id`: UUID primary key
- `name`: Property name
- `type`: Property type (Apartment, Villa, etc.)
- `description`: Property description
- `price_range`: Display price (e.g., "AED 1M - 2M")
- `size`: Display size (e.g., "1200 sq ft")
- `location`: Dubai location
- `amenities`: Array of amenities
- `image_url`: Property image URL
- `link`: Property details page URL
- `metadata`: JSON with structured data (bedrooms, price_min, price_max, etc.)

### Document Embeddings Table
- `id`: UUID primary key
- `property_id`: Foreign key to properties
- `content`: Text content used for embedding
- `embedding`: Vector(1536) - OpenAI embedding
- `metadata`: Additional metadata

## API Costs

**OpenAI Usage:**
- Embeddings: ~$0.0001 per property
- Chat: ~$0.001-0.002 per conversation
- Whisper (voice): ~$0.006 per minute

**Estimated Monthly Cost:**
- 1000 properties: ~$0.10
- 1000 conversations: ~$1-2
- 100 voice transcriptions: ~$0.60

## Testing

1. Upload a sample PDF with property details
2. Use the chatbot to search for properties
3. Test voice input feature
4. Verify property cards display correctly
5. Test "View Details" and "Contact Sales" buttons

## Production Deployment

Before deploying:
1. Replace all placeholder URLs in property data
2. Add real property images
3. Set up proper error handling
4. Configure CORS if needed
5. Add analytics tracking
6. Set up proper contact form integration

## Troubleshooting

**No search results:**
- Check if properties are in database
- Verify OpenAI API key is correct
- Check browser console for errors
- Try widening search filters

**PDF upload not working:**
- Ensure PDF.js is loaded (check console)
- Verify PDF contains readable text
- Check file size (limit: 10MB recommended)

**Voice input not working:**
- Allow microphone permissions in browser
- Check HTTPS (required for microphone access)
- Verify OpenAI API key is valid

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure Supabase connection is working
4. Check OpenAI API quota and billing

## File Structure

```
src/
├── components/
│   ├── ChatWidget.tsx       # Main chat interface
│   ├── ChatMessage.tsx      # Message and button rendering
│   └── PropertyCard.tsx     # Property result cards
├── services/
│   ├── openai.ts           # OpenAI API integration
│   ├── propertySearch.ts   # Search and filtering logic
│   └── pdfProcessor.ts     # PDF parsing and extraction
├── utils/
│   └── conversationFlow.ts # Chatbot conversation logic
├── types/
│   └── index.ts            # TypeScript interfaces
└── lib/
    └── supabase.ts         # Supabase client setup
```

## Next Steps

1. Add your OpenAI API key to `.env`
2. Upload property PDFs or manually add properties
3. Test the chatbot flow
4. Customize colors and branding
5. Add your website URLs to property links
6. Deploy to production

Enjoy your AI-powered real estate chatbot!
