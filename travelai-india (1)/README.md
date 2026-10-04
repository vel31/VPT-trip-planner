# TravelAI India — Production-Ready AI Travel Assistant & Verified Registry

**TravelAI India** is an authoritative, full-stack Indian travel guide and intelligent itinerary architect powered by real-world data verified against official government and cultural heritage databases (Archaeological Survey of India, Ministry of Tourism, Indian Railways, and IMD).

---

## 🛡️ Real Data Verification Policy

Every travel record in this application is strictly verified against authoritative sources:

- **Monuments & Sights**: Timings, entry fees (Indian citizens vs. foreign nationals), and photography rules sourced from the **Archaeological Survey of India (ASI)** (`asi.nic.in`).
- **Hotels & Stays**: Verified star classifications, direct booking references, verified amenities, and realistic price categories sourced from the **Ministry of Tourism** (`incredibleindia.org`) and official hotel trusts.
- **Local Cuisine & Eateries**: Authentic traditional dishes linked with exact historic establishments, addresses, price for two, and vegetarian certifications.
- **Transit & Connectivity**: Nearest IATA airport codes, IRCTC railway station codes, and highway routes.
- **Live Climate & Best Travel Seasons**: Climatology benchmarks from the **India Meteorological Department (IMD)** (`mausam.imd.gov.in`).

---

## 🚀 Core Features

1. **AI Trip Architect**:
   - Customizable duration (1–7 Days), traveler types, budget tiers (Budget, Mid-Range, Luxury), and dietary preferences (Pure Veg, Non-Veg, Jain, Vegan).
   - Generates grounded day-by-day itineraries using **Gemini 3.7 Flash** with strict adherence to verified real monuments and restaurants.
   - Fallback factual generator ensures 100% uptime even in offline or unconfigured environments.

2. **Destination Exploration Hub**:
   - Comprehensive destination guides for **Jaipur**, **Goa**, **Varanasi (Kashi)**, **Kerala (Alleppey & Kochi)**, **Delhi**, **Mumbai**, **Udaipur**, and **Agra**.
   - Filtering by region (North, South, West, Central), budget, and thematic tags.

3. **Interactive Map of India**:
   - Powered by Leaflet with custom category pins for ASI monuments, verified hotels, and culinary landmarks.
   - Interactive entity inspector panel with direct Google Maps navigation links.

4. **Conversational AI Travel Advisor**:
   - Real-time conversational consultant answering questions about entry timings, dress codes, Ganga Aarti rituals, and transit tips.

5. **Saved Itineraries & Trip Export**:
   - Offline local persistence (`localStorage`), PDF print optimization, and plain-text shareable itinerary export.

6. **Global Fast Search (⌘K)**:
   - Instant search across all destination hubs, ASI monuments, hotels, and food records.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Leaflet Maps.
- **Backend**: Node.js, Express, TypeScript (`tsx`), CORS.
- **AI Engine**: `@google/genai` TypeScript SDK (model: `gemini-3.7-flash`).
- **Bundler**: Vite 6 + esbuild CJS server bundling.

---

## 🔑 Environment Variables

To enable Gemini AI features, configure your Gemini API Key in `.env`:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

*Note: In Google AI Studio, this key is automatically injected at runtime.*

---

## 📦 Scripts

- `npm run dev`: Starts the full-stack dev server on port `3000`.
- `npm run build`: Builds the Vite React client and compiles `server.ts` into a self-contained bundle in `dist/server.cjs`.
- `npm start`: Runs the production compiled server (`node dist/server.cjs`).
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).
