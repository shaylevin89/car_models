import { CarBrand, DifficultyTier } from '../types/game';

export type { DifficultyTier };

const CDN_BASE = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/';

/**
 * Constructs the full logo URL from a brand's logoSlug.
 * Single source of truth for the logo source pattern.
 * Uses filippofilip95/car-logos-dataset on GitHub (verified working).
 */
export function getLogoUrl(logoSlug: string): string {
  return `${CDN_BASE}${logoSlug}.png`;
}

export const carBrands: CarBrand[] = [
  // Tier 1 — Well Known
  {
    name: 'Toyota',
    logoSlug: 'toyota',
    models: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Highlander', 'Land Cruiser', 'Prius', 'Supra'],
    tier: 1,
  },
  {
    name: 'BMW',
    logoSlug: 'bmw',
    models: ['3 Series', '5 Series', 'X5', 'X3', '7 Series', 'M3', 'i4', 'X1'],
    tier: 1,
  },
  {
    name: 'Mercedes-Benz',
    logoSlug: 'mercedes-benz',
    models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'AMG GT', 'CLA'],
    tier: 1,
  },
  {
    name: 'Honda',
    logoSlug: 'honda',
    models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Fit', 'Pilot', 'Odyssey'],
    tier: 1,
  },
  {
    name: 'Ford',
    logoSlug: 'ford',
    models: ['Mustang', 'F-150', 'Focus', 'Explorer', 'Bronco', 'Ranger', 'Escape'],
    tier: 1,
  },
  {
    name: 'Chevrolet',
    logoSlug: 'chevrolet',
    models: ['Corvette', 'Camaro', 'Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Blazer'],
    tier: 1,
  },
  {
    name: 'Audi',
    logoSlug: 'audi',
    models: ['A4', 'A6', 'Q5', 'Q7', 'A3', 'e-tron', 'RS6', 'TT'],
    tier: 1,
  },
  {
    name: 'Volkswagen',
    logoSlug: 'volkswagen',
    models: ['Golf', 'Passat', 'Tiguan', 'Polo', 'Jetta', 'ID.4', 'Arteon', 'T-Roc'],
    tier: 1,
  },
  {
    name: 'Hyundai',
    logoSlug: 'hyundai',
    models: ['Tucson', 'Elantra', 'Santa Fe', 'Sonata', 'Kona', 'Ioniq 5', 'Palisade'],
    tier: 1,
  },
  {
    name: 'Kia',
    logoSlug: 'kia',
    models: ['Sportage', 'Sorento', 'Seltos', 'Forte', 'Telluride', 'EV6', 'Stinger'],
    tier: 1,
  },
  {
    name: 'Nissan',
    logoSlug: 'nissan',
    models: ['Altima', 'Rogue', 'Sentra', 'Pathfinder', 'Maxima', 'GT-R', 'Leaf', 'Juke'],
    tier: 1,
  },
  {
    name: 'Tesla',
    logoSlug: 'tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
    tier: 1,
  },
  {
    name: 'Porsche',
    logoSlug: 'porsche',
    models: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera', 'Boxster', 'Cayman'],
    tier: 1,
  },
  {
    name: 'Ferrari',
    logoSlug: 'ferrari',
    models: ['F40', '458 Italia', 'Roma', 'SF90', 'Portofino', '812 Superfast', 'LaFerrari'],
    tier: 1,
  },
  {
    name: 'Lamborghini',
    logoSlug: 'lamborghini',
    models: ['Huracan', 'Aventador', 'Urus', 'Gallardo', 'Murcielago', 'Diablo', 'Countach'],
    tier: 1,
  },
  // Tier 2 — Known
  {
    name: 'Mazda',
    logoSlug: 'mazda',
    models: ['Mazda3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30', 'Mazda6'],
    tier: 2,
  },
  {
    name: 'Subaru',
    logoSlug: 'subaru',
    models: ['Outback', 'Forester', 'Impreza', 'WRX', 'Crosstrek', 'Legacy', 'BRZ'],
    tier: 2,
  },
  {
    name: 'Volvo',
    logoSlug: 'volvo',
    models: ['XC90', 'XC60', 'XC40', 'S60', 'S90', 'V60', 'C40'],
    tier: 2,
  },
  {
    name: 'Lexus',
    logoSlug: 'lexus',
    models: ['RX', 'ES', 'NX', 'IS', 'GX', 'LS', 'LC', 'UX'],
    tier: 2,
  },
  {
    name: 'Jaguar',
    logoSlug: 'jaguar',
    models: ['F-Pace', 'XE', 'XF', 'F-Type', 'E-Pace', 'I-Pace', 'XJ'],
    tier: 2,
  },
  {
    name: 'Land Rover',
    logoSlug: 'land-rover',
    models: ['Range Rover', 'Defender', 'Discovery', 'Evoque', 'Velar'],
    tier: 2,
  },
  {
    name: 'Jeep',
    logoSlug: 'jeep',
    models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator'],
    tier: 2,
  },
  {
    name: 'Dodge',
    logoSlug: 'dodge',
    models: ['Charger', 'Challenger', 'Durango', 'Viper', 'Hornet'],
    tier: 2,
  },
  {
    name: 'Cadillac',
    logoSlug: 'cadillac',
    models: ['Escalade', 'CT5', 'CT4', 'XT5', 'XT4', 'Lyriq', 'Celestiq'],
    tier: 2,
  },
  {
    name: 'Chrysler',
    logoSlug: 'chrysler',
    models: ['300', 'Pacifica', 'Voyager', 'Town and Country', 'Sebring'],
    tier: 2,
  },
  {
    name: 'Fiat',
    logoSlug: 'fiat',
    models: ['500', 'Panda', 'Tipo', 'Punto', '500X', '124 Spider', 'Doblo'],
    tier: 2,
  },
  {
    name: 'Alfa Romeo',
    logoSlug: 'alfa-romeo',
    models: ['Giulia', 'Stelvio', 'Tonale', '4C', 'Giulietta', 'MiTo'],
    tier: 2,
  },
  {
    name: 'Peugeot',
    logoSlug: 'peugeot',
    models: ['208', '308', '3008', '5008', '508', '2008', 'e-208'],
    tier: 2,
  },
  {
    name: 'Renault',
    logoSlug: 'renault',
    models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Zoe', 'Arkana'],
    tier: 2,
  },
  {
    name: 'MINI',
    logoSlug: 'mini',
    models: ['Cooper', 'Countryman', 'Clubman', 'Convertible', 'Paceman'],
    tier: 2,
  },
  {
    name: 'Mitsubishi',
    logoSlug: 'mitsubishi',
    models: ['Outlander', 'Eclipse Cross', 'ASX', 'L200', 'Pajero', 'Mirage'],
    tier: 2,
  },
  {
    name: 'Suzuki',
    logoSlug: 'suzuki',
    models: ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis', 'Baleno', 'Alto'],
    tier: 2,
  },
  {
    name: 'Infiniti',
    logoSlug: 'infiniti',
    models: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80', 'QX55'],
    tier: 2,
  },
  {
    name: 'Genesis',
    logoSlug: 'genesis',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'],
    tier: 2,
  },
  {
    name: 'Buick',
    logoSlug: 'buick',
    models: ['Enclave', 'Encore', 'Envision', 'Regal', 'LaCrosse'],
    tier: 2,
  },
  // Tier 3 — Obscure
  {
    name: 'Maserati',
    logoSlug: 'maserati',
    models: ['Ghibli', 'Levante', 'Quattroporte', 'MC20', 'GranTurismo', 'Grecale'],
    tier: 3,
  },
  {
    name: 'Bentley',
    logoSlug: 'bentley',
    models: ['Continental GT', 'Bentayga', 'Flying Spur', 'Mulsanne', 'Bacalar'],
    tier: 3,
  },
  {
    name: 'Aston Martin',
    logoSlug: 'aston-martin',
    models: ['DB11', 'Vantage', 'DBX', 'DB12', 'Valkyrie', 'DBS'],
    tier: 3,
  },
  {
    name: 'Rolls-Royce',
    logoSlug: 'rolls-royce',
    models: ['Phantom', 'Ghost', 'Cullinan', 'Wraith', 'Dawn', 'Spectre'],
    tier: 3,
  },
  {
    name: 'McLaren',
    logoSlug: 'mclaren',
    models: ['720S', '570S', 'Artura', 'Senna', 'P1', 'Speedtail'],
    tier: 3,
  },
  {
    name: 'Lotus',
    logoSlug: 'lotus',
    models: ['Elise', 'Evora', 'Emira', 'Eletre', 'Exige', 'Esprit'],
    tier: 3,
  },
  {
    name: 'Bugatti',
    logoSlug: 'bugatti',
    models: ['Chiron', 'Veyron', 'Divo', 'Centodieci', 'Bolide', 'Mistral'],
    tier: 3,
  },
  {
    name: 'Skoda',
    logoSlug: 'skoda',
    models: ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Fabia', 'Kamiq', 'Enyaq'],
    tier: 3,
  },
  {
    name: 'Seat',
    logoSlug: 'seat',
    models: ['Leon', 'Ibiza', 'Arona', 'Ateca', 'Tarraco'],
    tier: 3,
  },
  {
    name: 'Dacia',
    logoSlug: 'dacia',
    models: ['Duster', 'Sandero', 'Logan', 'Spring', 'Jogger', 'Bigster'],
    tier: 3,
  },
  {
    name: 'Opel',
    logoSlug: 'opel',
    models: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Insignia'],
    tier: 3,
  },
  {
    name: 'Citroen',
    logoSlug: 'citroen',
    models: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'C3 Aircross', 'Ami'],
    tier: 3,
  },
  {
    name: 'Lancia',
    logoSlug: 'lancia',
    models: ['Ypsilon', 'Delta', 'Stratos', 'Fulvia', 'Thema', 'Aurelia'],
    tier: 3,
  },
  {
    name: 'Saab',
    logoSlug: 'saab',
    models: ['9-3', '9-5', '900', '9000', '9-2X', '9-4X'],
    tier: 3,
  },
  {
    name: 'Smart',
    logoSlug: 'smart',
    models: ['Fortwo', 'Forfour', 'EQ Fortwo', 'EQ Forfour'],
    tier: 3,
  },
];
