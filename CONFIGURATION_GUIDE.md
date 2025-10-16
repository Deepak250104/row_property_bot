# Configuration Guide - Real Estate Chatbot

## Overview
This guide explains how to configure the chatbot for different clients and property projects. The system is designed to be easily configurable by changing a few key files.

---

## Quick Configuration Steps

### 1. Add Client Configuration

**File:** `/src/config/clients.json`

This is the main configuration file. Edit this to add new clients or projects.

```json
{
  "currentClient": "IndRoyal",
  "clients": {
    "IndRoyal": {
      "name": "IndRoyal Properties",
      "projects": {
        "TheUptown": {
          "path": "data/client_data/IndRoyal/TheUptown/propertyInfo.pdf",
          "link": "https://indroyalproperties.com/the-uptown-luxury-flat-trivandrum/",
          "embeddingsPath": "data/client_data/IndRoyal/TheUptown/embeddings.json"
        }
      }
    }
  }
}
```

**To Add a New Client:**

```json
{
  "currentClient": "NewBuilder",
  "clients": {
    "NewBuilder": {
      "name": "New Builder Name",
      "projects": {
        "ProjectName": {
          "path": "data/client_data/NewBuilder/ProjectName/propertyInfo.pdf",
          "link": "https://newbuilder.com/project-details/",
          "embeddingsPath": "data/client_data/NewBuilder/ProjectName/embeddings.json"
        }
      }
    }
  }
}
```

---

## Step-by-Step: Adding New Property Data

### Step 1: Create Folder Structure

```bash
mkdir -p data/client_data/YourClient/YourProject
```

### Step 2: Add Your PDF

Place your property information PDF in the folder:
```
data/client_data/YourClient/YourProject/propertyInfo.pdf
```

### Step 3: Update Configuration

Edit `/src/config/clients.json`:
- Change `currentClient` to your client name
- Add your client under `clients`
- Set the correct `path` to your PDF
- Set the `link` to where users should be redirected
- Set the `embeddingsPath` (where embeddings will be saved)

### Step 4: Run PDF Ingestion

```bash
npm run ingest
```

This will:
- Read your PDF
- Extract text and parse properties
- Generate OpenAI embeddings
- Save embeddings to the specified path

### Step 5: Start the Application

```bash
npm run dev
```

---

## Mock Data Configuration

### Enabling/Disabling Mock Data

**File:** `/src/config/mockData.ts`

At the bottom of the file, you'll find:

```typescript
export const ENABLE_MOCK_DATA = true;
```

**To Use Real Embeddings:**
1. Run `npm run ingest` to create embeddings from your PDF
2. Change to: `export const ENABLE_MOCK_DATA = false;`
3. Restart the dev server

**To Use Mock Data (for testing):**
- Keep as: `export const ENABLE_MOCK_DATA = true;`
- Mock data will be generated based on user preferences
- All mock properties link to the URL in `clients.json`

---

## Mock Data Customization

**File:** `/src/config/mockData.ts`

The `generateMockProperties()` function creates 3 sample properties based on user preferences.

**What Mock Data Includes:**
- Property name (based on preferences)
- Type (Apartment, Villa, etc.)
- Price range (from user's budget)
- Size (from user's size preference)
- Location (from user's location preference or "Trivandrum")
- Amenities (from user's amenity selection)
- Link (from `clients.json`)
- Stock images from Pexels

**To Remove Mock Data in Future:**

1. Set `ENABLE_MOCK_DATA = false` in `/src/config/mockData.ts`
2. Ensure your embeddings are generated (`npm run ingest`)
3. That's it! The app will use real embedding search

**Files Affected by Mock Data:**
- `/src/config/mockData.ts` - Mock data generation
- `/src/components/ChatWidget.tsx` - Uses mock data when enabled

---

## File Reference Guide

### Configuration Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `/src/config/clients.json` | Client and project configuration | Add new clients or projects |
| `/src/config/mockData.ts` | Mock data generation and toggle | Customize mock results or disable |
| `/.env` | API keys | Add OpenAI API key |

### Key Source Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `/scripts/ingestPDF.ts` | PDF processing and embedding generation | Customize PDF parsing logic |
| `/src/services/embeddingSearch.ts` | Real embedding search | Adjust search algorithm |
| `/src/components/ChatWidget.tsx` | Main chat interface | Change UI behavior |
| `/src/utils/conversationFlow.ts` | Question flow logic | Add/modify questions |

---

## Where Things Are Stored

### 1. Property Links
**Location:** `/src/config/clients.json`
```json
"link": "https://your-website.com/property-page/"
```
All search results will use this link in the "View Details" button.

### 2. Mock Property Data
**Location:** `/src/config/mockData.ts`
```typescript
const mockProperties: Property[] = [
  {
    id: 'mock-1',
    name: `Property Name`,
    // ... other fields
    link: project.link,  // ← Gets link from clients.json
  }
]
```

### 3. Real Embeddings
**Location:** `data/client_data/{ClientName}/{ProjectName}/embeddings.json`

This file is auto-generated when you run `npm run ingest`.

### 4. Property Images
**Currently:** Using stock Pexels images
**Location:** `/src/services/embeddingSearch.ts` - `getPropertyImage()` function
**Location (mock):** `/src/config/mockData.ts` - `image_url` field

To use real images:
1. Host images on your server or CDN
2. Update `image_url` in mock data or embeddings

---

## PDF Content Format

Your PDF should contain property information in a readable format. The ingestion script looks for:

**Property Details:**
- Property/Project names
- Types (Apartment, Villa, etc.)
- Prices (₹50L, ₹1Cr, etc.)
- Sizes (1200 sq ft, etc.)
- Locations (city names)
- Amenities (pool, gym, parking, etc.)
- Bedroom counts (2 BHK, 3 BHK, etc.)

**Example PDF Content:**
```
The Uptown Luxury Apartments

Premium residential project in Trivandrum featuring 2 BHK and 3 BHK apartments.

Pricing: ₹45 Lakhs to ₹85 Lakhs
Size: 1100 to 1800 sq ft
Location: Trivandrum, Kerala

Amenities:
- Swimming Pool
- Gym
- 24/7 Security
- Parking
- Clubhouse
- Kids Play Area
```

---

## Testing Your Configuration

### 1. Test Mock Data (Quickest)
```bash
# Ensure ENABLE_MOCK_DATA = true in mockData.ts
npm run dev
```
Use the chatbot - it will show 3 mock properties matching your search.

### 2. Test Real Embeddings
```bash
# Add your PDF to data/client_data/...
npm run ingest
# Change ENABLE_MOCK_DATA = false
npm run dev
```
Use the chatbot - it will search your actual PDF data.

### 3. Test Different Clients
1. Add new client config to `clients.json`
2. Change `currentClient` to new client name
3. Run `npm run ingest`
4. Restart dev server

---

## Switching Between Clients

To test with a different client's data:

1. Edit `/src/config/clients.json`
2. Change `currentClient` to the desired client name:
   ```json
   "currentClient": "NewBuilder"
   ```
3. Ensure the PDF exists at the specified path
4. Run `npm run ingest` to generate embeddings
5. Restart the dev server

---

## Troubleshooting

### Mock Data Not Showing
- Check `ENABLE_MOCK_DATA = true` in `/src/config/mockData.ts`
- Verify link in `/src/config/clients.json` is correct

### Real Search Not Working
- Run `npm run ingest` to create embeddings
- Set `ENABLE_MOCK_DATA = false`
- Check embeddings.json file was created
- Ensure OpenAI API key is set in `.env`

### PDF Ingestion Fails
- Verify PDF path in `clients.json` is correct
- Check PDF is readable and contains text (not just images)
- Ensure OpenAI API key is valid

### No Results Found
- Check if embeddings exist
- Try with mock data first
- Verify PDF content matches search criteria

---

## Production Checklist

Before deploying to production:

- [ ] Set `ENABLE_MOCK_DATA = false`
- [ ] Run `npm run ingest` for all clients
- [ ] Update all property links in `clients.json`
- [ ] Add real property images
- [ ] Test with actual user queries
- [ ] Set up proper error handling
- [ ] Configure analytics

---

## Summary: Key Files to Edit

1. **Add New Client:** Edit `/src/config/clients.json`
2. **Add PDF:** Place in `data/client_data/{Client}/{Project}/`
3. **Generate Embeddings:** Run `npm run ingest`
4. **Toggle Mock Data:** Edit `/src/config/mockData.ts`
5. **Customize Questions:** Edit `/src/utils/conversationFlow.ts`

That's it! The system is designed to be simple and configurable without breaking anything.
