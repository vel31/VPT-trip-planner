import { Destination, Hotel, Attraction, FoodItem } from '../../src/types';
import { generateDestinationData } from './autoEnrichment';
import { andhraPradeshDestinations } from './master/andhra_pradesh';
import { arunachalPradeshDestinations } from './master/arunachal_pradesh';
import { assamDestinations } from './master/assam';
import { biharDestinations, jharkhandDestinations } from './master/bihar_jharkhand';
import { chhattisgarhDestinations, odishaDestinations } from './master/chhattisgarh_odisha';
import { goaDestinations, gujaratDestinations } from './master/goa_gujarat';
import { haryanaDestinations, punjabDestinations } from './master/haryana_punjab';
import { himachalDestinations, uttarakhandDestinations } from './master/himachal_uttarakhand';
import { karnatakaDestinations } from './master/karnataka';
import { keralaDestinations } from './master/kerala';
import { madhyaPradeshDestinations } from './master/madhya_pradesh';
import { maharashtraDestinations } from './master/maharashtra';
import { northeastDestinations } from './master/northeast_states';
import { rajasthanDestinations } from './master/rajasthan';
import { tamilNaduDestinations } from './master/tamil_nadu';
import { telanganaDestinations } from './master/telangana';
import { uttarPradeshDestinations } from './master/uttar_pradesh';
import { westBengalDestinations } from './master/west_bengal';
import { unionTerritoryDestinations } from './master/union_territories';

import { jaipurHotels, jaipurAttractions, jaipurFood } from './jaipur';
import { goaHotels, goaAttractions, goaFood } from './goa';
import { varanasiHotels, varanasiAttractions, varanasiFood } from './varanasi';
import { keralaHotels, keralaAttractions, keralaFood } from './kerala';
import { delhiHotels, delhiAttractions, delhiFood } from './delhi';
import { mumbaiHotels, mumbaiAttractions, mumbaiFood } from './mumbai';
import { udaipurHotels, udaipurAttractions, udaipurFood } from './rajasthan_extended';
import { agraHotels, agraAttractions, agraFood } from './uttarpradesh';
import { rishikeshHotels, rishikeshAttractions, rishikeshFood, manaliHotels, manaliAttractions, manaliFood } from './himachal_uttarakhand';
import { srinagarHotels, srinagarAttractions, srinagarFood, lehHotels, lehAttractions, lehFood } from './kashmir_ladakh';
import { hampiHotels, hampiAttractions, hampiFood, hyderabadHotels, hyderabadAttractions, hyderabadFood } from './south_india';
import { amritsarHotels, amritsarAttractions, amritsarFood, maduraiHotels, maduraiAttractions, maduraiFood } from './punjab_tamilnadu';

// Combine all master lists across all 28 States and 8 Union Territories
const rawMasterDestinations: Destination[] = [
  ...andhraPradeshDestinations,
  ...arunachalPradeshDestinations,
  ...assamDestinations,
  ...biharDestinations,
  ...jharkhandDestinations,
  ...chhattisgarhDestinations,
  ...odishaDestinations,
  ...goaDestinations,
  ...gujaratDestinations,
  ...haryanaDestinations,
  ...punjabDestinations,
  ...himachalDestinations,
  ...uttarakhandDestinations,
  ...karnatakaDestinations,
  ...keralaDestinations,
  ...madhyaPradeshDestinations,
  ...maharashtraDestinations,
  ...northeastDestinations,
  ...rajasthanDestinations,
  ...tamilNaduDestinations,
  ...telanganaDestinations,
  ...uttarPradeshDestinations,
  ...westBengalDestinations,
  ...unionTerritoryDestinations
];

// Deduplicate by ID to guarantee uniqueness
const destinationMap = new Map<string, Destination>();
for (const d of rawMasterDestinations) {
  if (!destinationMap.has(d.id)) {
    destinationMap.set(d.id, d);
  }
}

export const allDestinations: Destination[] = Array.from(destinationMap.values()).map(d => ({
  ...d,
  heroImageUrl: d.heroImageUrl || d.featuredImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  overview: d.overview || d.description,
  budgetTier: d.budgetTier || 'Mid-Range',
  idealFor: d.idealFor || d.popularFor || (d.categories as string[]) || ['Heritage', 'Culture', 'Sightseeing'],
  weatherSummary: d.weatherSummary || `${d.bestTimeToVisit} (Clear and pleasant)`,
  localCustoms: d.localCustoms || [
    'Remove footwear before entering shrines and heritage sanctums.',
    'Dress respectfully covering shoulders and knees at sacred sites.',
    'Use authorized prepaid taxis or registered app cabs.'
  ],
  connectivity: d.connectivity || {
    nearestAirport: {
      name: `${d.name} Airport`,
      code: d.id.slice(0, 3).toUpperCase(),
      distanceKm: 15
    },
    nearestRailwayStation: {
      name: `${d.name} Junction`,
      code: d.id.slice(0, 3).toUpperCase() + 'J',
      distanceKm: 4
    },
    roadConnectivity: `Direct national highway and express bus connectivity across ${d.state} and neighboring states.`
  }
}));

export const allHotels: Hotel[] = [
  ...jaipurHotels,
  ...goaHotels,
  ...varanasiHotels,
  ...keralaHotels,
  ...delhiHotels,
  ...mumbaiHotels,
  ...udaipurHotels,
  ...agraHotels,
  ...rishikeshHotels,
  ...manaliHotels,
  ...srinagarHotels,
  ...lehHotels,
  ...hampiHotels,
  ...hyderabadHotels,
  ...amritsarHotels,
  ...maduraiHotels
].map(h => ({
  ...h,
  coordinates: h.coordinates || (h.latitude && h.longitude ? { lat: h.latitude, lng: h.longitude } : undefined)
}));

export const allAttractions: Attraction[] = [
  ...jaipurAttractions,
  ...goaAttractions,
  ...varanasiAttractions,
  ...keralaAttractions,
  ...delhiAttractions,
  ...mumbaiAttractions,
  ...udaipurAttractions,
  ...agraAttractions,
  ...rishikeshAttractions,
  ...manaliAttractions,
  ...srinagarAttractions,
  ...lehAttractions,
  ...hampiAttractions,
  ...hyderabadAttractions,
  ...amritsarAttractions,
  ...maduraiAttractions
].map(a => ({
  ...a,
  coordinates: a.coordinates || (a.latitude && a.longitude ? { lat: a.latitude, lng: a.longitude } : undefined)
}));

export const allFoodItems: FoodItem[] = [
  ...jaipurFood,
  ...goaFood,
  ...varanasiFood,
  ...keralaFood,
  ...delhiFood,
  ...mumbaiFood,
  ...udaipurFood,
  ...agraFood,
  ...rishikeshFood,
  ...manaliFood,
  ...srinagarFood,
  ...lehFood,
  ...hampiFood,
  ...hyderabadFood,
  ...amritsarFood,
  ...maduraiFood
].map(f => ({
  ...f,
  coordinates: f.coordinates || (f.famousEstablishment?.latitude && f.famousEstablishment?.longitude ? { lat: f.famousEstablishment.latitude, lng: f.famousEstablishment.longitude } : undefined)
}));

export function getDestinationById(id: string): Destination | undefined {
  return allDestinations.find(d => d.id.toLowerCase() === id.toLowerCase());
}

// Internal memory cache for dynamically enriched destination data
const dynamicDataCache = new Map<string, { attractions: Attraction[]; hotels: Hotel[]; food: FoodItem[] }>();

function getOrGenerateData(destinationId: string) {
  const normalizedId = destinationId.toLowerCase();
  if (dynamicDataCache.has(normalizedId)) {
    return dynamicDataCache.get(normalizedId)!;
  }
  const dest = getDestinationById(destinationId);
  if (!dest) {
    return { attractions: [], hotels: [], food: [] };
  }
  const generated = generateDestinationData(dest);
  dynamicDataCache.set(normalizedId, generated);
  return generated;
}

export function getHotelsByDestination(destinationId: string): Hotel[] {
  const staticHotels = allHotels.filter(h => h.destinationId.toLowerCase() === destinationId.toLowerCase());
  if (staticHotels.length > 0) return staticHotels;
  return getOrGenerateData(destinationId).hotels;
}

export function getAttractionsByDestination(destinationId: string): Attraction[] {
  const staticAttractions = allAttractions.filter(a => a.destinationId.toLowerCase() === destinationId.toLowerCase());
  if (staticAttractions.length > 0) return staticAttractions;
  return getOrGenerateData(destinationId).attractions;
}

export function getFoodByDestination(destinationId: string): FoodItem[] {
  const staticFood = allFoodItems.filter(f => f.destinationId.toLowerCase() === destinationId.toLowerCase());
  if (staticFood.length > 0) return staticFood;
  return getOrGenerateData(destinationId).food;
}

export function searchAllRecords(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return { destinations: allDestinations, hotels: allHotels, attractions: allAttractions, food: allFoodItems };

  const matchedDestinations = allDestinations.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.state.toLowerCase().includes(q) || 
    d.tagline.toLowerCase().includes(q) ||
    (d.idealFor && d.idealFor.some(tag => tag.toLowerCase().includes(q))) ||
    (d.popularFor && d.popularFor.some(tag => tag.toLowerCase().includes(q)))
  );

  let matchedHotels = allHotels.filter(h => 
    h.name.toLowerCase().includes(q) || 
    h.destinationName.toLowerCase().includes(q) || 
    (h.amenities && h.amenities.some(a => a.toLowerCase().includes(q))) ||
    h.priceCategory.toLowerCase().includes(q)
  );

  let matchedAttractions = allAttractions.filter(a => 
    a.name.toLowerCase().includes(q) || 
    a.destinationName.toLowerCase().includes(q) || 
    a.category.toLowerCase().includes(q) || 
    a.description.toLowerCase().includes(q)
  );

  let matchedFood = allFoodItems.filter(f => 
    f.name.toLowerCase().includes(q) || 
    f.destinationName.toLowerCase().includes(q) || 
    f.cuisine.toLowerCase().includes(q) || 
    f.description.toLowerCase().includes(q) ||
    (f.famousEstablishment?.name || '').toLowerCase().includes(q)
  );

  // If matched destinations have generated items, include them in results
  if (matchedDestinations.length > 0) {
    for (const d of matchedDestinations) {
      const extraHotels = getHotelsByDestination(d.id);
      const extraAttractions = getAttractionsByDestination(d.id);
      const extraFood = getFoodByDestination(d.id);

      for (const h of extraHotels) {
        if (!matchedHotels.some(item => item.id === h.id)) matchedHotels.push(h);
      }
      for (const a of extraAttractions) {
        if (!matchedAttractions.some(item => item.id === a.id)) matchedAttractions.push(a);
      }
      for (const f of extraFood) {
        if (!matchedFood.some(item => item.id === f.id)) matchedFood.push(f);
      }
    }
  }

  return {
    destinations: matchedDestinations,
    hotels: matchedHotels,
    attractions: matchedAttractions,
    food: matchedFood
  };
}
