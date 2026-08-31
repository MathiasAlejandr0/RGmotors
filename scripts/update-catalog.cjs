const fs = require('fs');

const realStock = JSON.parse(fs.readFileSync('scratch/final_real_stock.json', 'utf8'));

fs.writeFileSync('data/vehicles.json', JSON.stringify(realStock, null, 2), 'utf8');

const vehiclesTsContent = `// 100% Authentic RG Motors Stock from Official Inventory
export interface VehicleSpin {
  count: number;
  pattern?: string;
  ext?: string;
}

export interface Vehicle {
  slug: string;
  plate?: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  listPrice?: number;
  km: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  location: string;
  image: string;
  gallery?: string[];
  spin?: VehicleSpin;
  engine: string;
  power: string;
  traction: string;
  doors: number;
  owners: number;
  featured?: boolean;
  status?: "Disponible" | "En reserva" | "Vendido" | "Borrador" | "En preparación";
  hasRealPhotos?: boolean;
  supplier?: string;
  techReview?: string;
  circPermit?: string;
  highlights?: string[];
}

export const initialVehicles: Vehicle[] = ${JSON.stringify(realStock, null, 2)};
`;

fs.writeFileSync('lib/vehicles.ts', vehiclesTsContent, 'utf8');
console.log('Successfully updated lib/vehicles.ts and data/vehicles.json with', realStock.length, 'vehicles');
