/**
 * OpenConstructionEstimate - Mock Data
 *
 * Realistic construction cost data for development and testing.
 * Includes utilities to generate large datasets for performance testing.
 */

import type { ConstructionItem } from "./types";

/* ============================================
   CONSTRUCTION MATERIAL CATEGORIES
   ============================================ */

const CATEGORIES = [
  "Structural",
  "Concrete",
  "Steel",
  "Masonry",
  "Wood & Plastics",
  "Thermal & Moisture",
  "Doors & Windows",
  "Finishes",
  "Specialties",
  "Equipment",
  "Furnishings",
  "Mechanical",
  "Electrical",
  "Plumbing",
] as const;

/* ============================================
   UNITS OF MEASUREMENT
   ============================================ */

const UNITS = [
  "m2",
  "m3",
  "ml",
  "kg",
  "ton",
  "unit",
  "hr",
  "day",
  "lf",
  "sf",
  "cy",
  "ea",
] as const;

/* ============================================
   BASE MATERIALS DATABASE
   Realistic construction materials with pricing
   ============================================ */

const BASE_MATERIALS: Omit<ConstructionItem, "id" | "subtotal">[] = [
  // Concrete Work
  {
    descripcion: "Ready-mix concrete 4000 PSI",
    costoUnitario: 145.0,
    cantidad: 120,
    unidad: "cy",
    categoria: "Concrete",
    imagenUrl: "https://images.unsplash.com/photo-1590496793907-51d60a666296?w=400",
  },
  {
    descripcion: "Reinforcing steel bars #4",
    costoUnitario: 0.85,
    cantidad: 5000,
    unidad: "lf",
    categoria: "Steel",
    imagenUrl: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400",
  },
  {
    descripcion: "Concrete formwork - walls",
    costoUnitario: 12.5,
    cantidad: 2400,
    unidad: "sf",
    categoria: "Concrete",
    imagenUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
  },
  {
    descripcion: "Wire mesh 6x6 W2.9xW2.9",
    costoUnitario: 0.45,
    cantidad: 8500,
    unidad: "sf",
    categoria: "Concrete",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },

  // Steel Work
  {
    descripcion: "Structural steel W8x31",
    costoUnitario: 2850.0,
    cantidad: 45,
    unidad: "ton",
    categoria: "Steel",
    imagenUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400",
  },
  {
    descripcion: "Steel decking 1.5\" 20GA",
    costoUnitario: 3.25,
    cantidad: 12000,
    unidad: "sf",
    categoria: "Steel",
    imagenUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400",
  },
  {
    descripcion: "Miscellaneous metals - handrails",
    costoUnitario: 85.0,
    cantidad: 320,
    unidad: "lf",
    categoria: "Steel",
    imagenUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
  },

  // Masonry
  {
    descripcion: "CMU block 8x8x16 standard",
    costoUnitario: 2.45,
    cantidad: 6500,
    unidad: "ea",
    categoria: "Masonry",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Face brick - standard red",
    costoUnitario: 0.65,
    cantidad: 15000,
    unidad: "ea",
    categoria: "Masonry",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Mortar type S premixed",
    costoUnitario: 12.5,
    cantidad: 450,
    unidad: "unit",
    categoria: "Masonry",
  },

  // Wood & Plastics
  {
    descripcion: "Lumber 2x4x8 SPF stud grade",
    costoUnitario: 4.85,
    cantidad: 2800,
    unidad: "ea",
    categoria: "Wood & Plastics",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Plywood sheathing 1/2\" CDX",
    costoUnitario: 32.0,
    cantidad: 580,
    unidad: "ea",
    categoria: "Wood & Plastics",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Engineered wood I-joists 11-7/8\"",
    costoUnitario: 6.25,
    cantidad: 1200,
    unidad: "lf",
    categoria: "Wood & Plastics",
  },

  // Thermal & Moisture Protection
  {
    descripcion: "Batt insulation R-19",
    costoUnitario: 0.65,
    cantidad: 18000,
    unidad: "sf",
    categoria: "Thermal & Moisture",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Rigid insulation 2\" XPS",
    costoUnitario: 1.45,
    cantidad: 8500,
    unidad: "sf",
    categoria: "Thermal & Moisture",
  },
  {
    descripcion: "EPDM roofing membrane 60 mil",
    costoUnitario: 3.85,
    cantidad: 12000,
    unidad: "sf",
    categoria: "Thermal & Moisture",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Standing seam metal roofing",
    costoUnitario: 12.5,
    cantidad: 6500,
    unidad: "sf",
    categoria: "Thermal & Moisture",
  },

  // Doors & Windows
  {
    descripcion: "Hollow metal door frame 3-0x7-0",
    costoUnitario: 285.0,
    cantidad: 48,
    unidad: "ea",
    categoria: "Doors & Windows",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Wood door flush solid core",
    costoUnitario: 425.0,
    cantidad: 36,
    unidad: "ea",
    categoria: "Doors & Windows",
  },
  {
    descripcion: "Aluminum storefront system",
    costoUnitario: 45.0,
    cantidad: 850,
    unidad: "sf",
    categoria: "Doors & Windows",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Double pane window unit 4x5",
    costoUnitario: 385.0,
    cantidad: 64,
    unidad: "ea",
    categoria: "Doors & Windows",
  },

  // Finishes
  {
    descripcion: "Gypsum board 5/8\" type X",
    costoUnitario: 14.5,
    cantidad: 1200,
    unidad: "ea",
    categoria: "Finishes",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Ceramic tile floor 12x12",
    costoUnitario: 4.85,
    cantidad: 3500,
    unidad: "sf",
    categoria: "Finishes",
  },
  {
    descripcion: "Acoustical ceiling tile 2x4",
    costoUnitario: 3.25,
    cantidad: 8500,
    unidad: "sf",
    categoria: "Finishes",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Interior latex paint premium",
    costoUnitario: 0.45,
    cantidad: 45000,
    unidad: "sf",
    categoria: "Finishes",
  },
  {
    descripcion: "Carpet tile commercial grade",
    costoUnitario: 5.85,
    cantidad: 6500,
    unidad: "sf",
    categoria: "Finishes",
  },

  // Mechanical
  {
    descripcion: "HVAC rooftop unit 10 ton",
    costoUnitario: 12500.0,
    cantidad: 4,
    unidad: "ea",
    categoria: "Mechanical",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Ductwork galvanized 24\" dia",
    costoUnitario: 18.5,
    cantidad: 850,
    unidad: "lf",
    categoria: "Mechanical",
  },
  {
    descripcion: "VAV box with reheat coil",
    costoUnitario: 1850.0,
    cantidad: 24,
    unidad: "ea",
    categoria: "Mechanical",
  },

  // Electrical
  {
    descripcion: "Electrical panel 200A main",
    costoUnitario: 2450.0,
    cantidad: 6,
    unidad: "ea",
    categoria: "Electrical",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "Conduit EMT 3/4\"",
    costoUnitario: 2.85,
    cantidad: 4500,
    unidad: "lf",
    categoria: "Electrical",
  },
  {
    descripcion: "LED light fixture 2x4 troffer",
    costoUnitario: 185.0,
    cantidad: 120,
    unidad: "ea",
    categoria: "Electrical",
  },
  {
    descripcion: "Wire #12 THHN copper",
    costoUnitario: 0.35,
    cantidad: 25000,
    unidad: "lf",
    categoria: "Electrical",
  },

  // Plumbing
  {
    descripcion: "Copper pipe type L 2\"",
    costoUnitario: 18.5,
    cantidad: 650,
    unidad: "lf",
    categoria: "Plumbing",
    imagenUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    descripcion: "PVC pipe schedule 40 4\"",
    costoUnitario: 6.85,
    cantidad: 1200,
    unidad: "lf",
    categoria: "Plumbing",
  },
  {
    descripcion: "Water closet commercial flush",
    costoUnitario: 485.0,
    cantidad: 18,
    unidad: "ea",
    categoria: "Plumbing",
  },
  {
    descripcion: "Lavatory wall-hung vitreous",
    costoUnitario: 325.0,
    cantidad: 24,
    unidad: "ea",
    categoria: "Plumbing",
  },

  // Labor
  {
    descripcion: "Skilled labor - carpenter",
    costoUnitario: 75.0,
    cantidad: 480,
    unidad: "hr",
    categoria: "Labor",
  },
  {
    descripcion: "Skilled labor - electrician",
    costoUnitario: 85.0,
    cantidad: 320,
    unidad: "hr",
    categoria: "Labor",
  },
  {
    descripcion: "Skilled labor - plumber",
    costoUnitario: 82.0,
    cantidad: 280,
    unidad: "hr",
    categoria: "Labor",
  },
  {
    descripcion: "General labor",
    costoUnitario: 45.0,
    cantidad: 960,
    unidad: "hr",
    categoria: "Labor",
  },

  // Equipment
  {
    descripcion: "Crane rental - tower crane",
    costoUnitario: 2500.0,
    cantidad: 45,
    unidad: "day",
    categoria: "Equipment",
  },
  {
    descripcion: "Concrete pump truck",
    costoUnitario: 1200.0,
    cantidad: 12,
    unidad: "day",
    categoria: "Equipment",
  },
  {
    descripcion: "Scaffolding rental",
    costoUnitario: 850.0,
    cantidad: 60,
    unidad: "day",
    categoria: "Equipment",
  },
];

/* ============================================
   MOCK DATA GENERATION
   ============================================ */

/**
 * Creates a ConstructionItem with computed subtotal
 */
function createItem(
  base: Omit<ConstructionItem, "id" | "subtotal">,
  index: number
): ConstructionItem {
  const id = `ITEM-${String(index + 1).padStart(5, "0")}`;
  return {
    ...base,
    id,
    subtotal: base.costoUnitario * base.cantidad,
  };
}

/**
 * Generates a random variation of a base material
 */
function generateVariation(
  base: Omit<ConstructionItem, "id" | "subtotal">,
  variationIndex: number
): Omit<ConstructionItem, "id" | "subtotal"> {
  // Vary quantity by +/- 50%
  const quantityMultiplier = 0.5 + Math.random();
  const cantidad = Math.round(base.cantidad * quantityMultiplier);

  // Vary price by +/- 20%
  const priceMultiplier = 0.8 + Math.random() * 0.4;
  const costoUnitario = Math.round(base.costoUnitario * priceMultiplier * 100) / 100;

  // Add variation suffix to description
  const suffixes = [
    " - premium grade",
    " - standard",
    " - economy",
    " - Phase 1",
    " - Phase 2",
    " - Building A",
    " - Building B",
    " - Ground floor",
    " - Upper floors",
    " - Exterior",
    " - Interior",
  ];
  const suffix = suffixes[variationIndex % suffixes.length];

  return {
    ...base,
    descripcion: base.descripcion + suffix,
    costoUnitario,
    cantidad,
  };
}

/**
 * Generates a specified number of mock construction items
 * Used for performance testing with large datasets
 */
export function generateMockItems(count: number): ConstructionItem[] {
  const items: ConstructionItem[] = [];
  const baseCount = BASE_MATERIALS.length;

  for (let i = 0; i < count; i++) {
    const baseIndex = i % baseCount;
    const variationIndex = Math.floor(i / baseCount);
    const base = BASE_MATERIALS[baseIndex];

    // For the first cycle through base materials, use them as-is
    // For subsequent cycles, generate variations
    const material = variationIndex === 0
      ? base
      : generateVariation(base, variationIndex);

    items.push(createItem(material, i));
  }

  return items;
}

/* ============================================
   EXPORTED MOCK DATA
   ============================================ */

/**
 * Default mock data set - 50 items for development
 */
export const MOCK_CONSTRUCTION_ITEMS: ConstructionItem[] = generateMockItems(50);

/**
 * Large mock data set - 5000 items for performance testing
 */
export const LARGE_MOCK_DATASET: ConstructionItem[] = generateMockItems(5000);

/**
 * Extra large mock data set - 10000 items for stress testing
 */
export const XL_MOCK_DATASET: ConstructionItem[] = generateMockItems(10000);
