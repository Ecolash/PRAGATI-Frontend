export interface CropMetadata {
  emoji: string;
  category: string;
  description: string;
  season: string;
  waterRequirement: string;
  soilType: string;
  growthPeriod: string;
}

export const cropMetadata: Record<string, CropMetadata> = {
  rice: {
    emoji: "🌾",
    category: "Cereal Grain",
    description:
      "A staple food crop that thrives in flooded fields with high water requirements.",
    season: "Kharif (Monsoon)",
    waterRequirement: "High",
    soilType: "Clay, Loamy",
    growthPeriod: "120-150 days",
  },
  maize: {
    emoji: "🌽",
    category: "Cereal Grain",
    description:
      "A versatile crop used for food, feed, and industrial purposes with moderate water needs.",
    season: "Kharif/Rabi",
    waterRequirement: "Moderate",
    soilType: "Well-drained loamy",
    growthPeriod: "90-120 days",
  },
  chickpea: {
    emoji: "🫘",
    category: "Legume",
    description:
      "A protein-rich pulse crop that fixes nitrogen in soil and requires minimal water.",
    season: "Rabi (Winter)",
    waterRequirement: "Low",
    soilType: "Sandy loam",
    growthPeriod: "90-120 days",
  },
  kidneybeans: {
    emoji: "🫘",
    category: "Legume",
    description:
      "Nutritious beans rich in protein and fiber, suitable for cooler climates.",
    season: "Kharif",
    waterRequirement: "Moderate",
    soilType: "Well-drained loamy",
    growthPeriod: "90-110 days",
  },
  pigeonpeas: {
    emoji: "🫛",
    category: "Legume",
    description:
      "Drought-tolerant pulse crop that improves soil fertility through nitrogen fixation.",
    season: "Kharif",
    waterRequirement: "Low",
    soilType: "Sandy, well-drained",
    growthPeriod: "150-180 days",
  },
  mothbeans: {
    emoji: "🫘",
    category: "Legume",
    description:
      "Highly drought-resistant legume crop suitable for arid and semi-arid regions.",
    season: "Kharif",
    waterRequirement: "Very Low",
    soilType: "Sandy, poor soils",
    growthPeriod: "75-90 days",
  },
  mungbean: {
    emoji: "🫛",
    category: "Legume",
    description:
      "Fast-growing pulse crop with high protein content and nitrogen-fixing ability.",
    season: "Kharif/Summer",
    waterRequirement: "Low-Moderate",
    soilType: "Sandy loam",
    growthPeriod: "60-90 days",
  },
  blackgram: {
    emoji: "🫘",
    category: "Legume",
    description:
      "Protein-rich pulse crop that can grow in poor soils and low rainfall areas.",
    season: "Kharif/Rabi",
    waterRequirement: "Low",
    soilType: "Sandy loam, clay",
    growthPeriod: "70-90 days",
  },
  lentil: {
    emoji: "🫛",
    category: "Legume",
    description:
      "Cool-season pulse crop rich in protein and essential amino acids.",
    season: "Rabi (Winter)",
    waterRequirement: "Low",
    soilType: "Well-drained loamy",
    growthPeriod: "95-110 days",
  },
  pomegranate: {
    emoji: "🍎",
    category: "Fruit",
    description:
      "Antioxidant-rich fruit that thrives in semi-arid conditions with good drainage.",
    season: "Perennial",
    waterRequirement: "Moderate",
    soilType: "Well-drained, sandy loam",
    growthPeriod: "6-7 months (fruiting)",
  },
  banana: {
    emoji: "🍌",
    category: "Fruit",
    description:
      "Tropical fruit crop requiring warm climate and consistent moisture.",
    season: "Year-round",
    waterRequirement: "High",
    soilType: "Rich, well-drained loamy",
    growthPeriod: "12-15 months",
  },
  mango: {
    emoji: "🥭",
    category: "Fruit",
    description:
      "King of fruits requiring tropical climate and well-drained soil.",
    season: "Perennial",
    waterRequirement: "Moderate",
    soilType: "Deep, well-drained",
    growthPeriod: "3-5 months (fruiting)",
  },
  grapes: {
    emoji: "🍇",
    category: "Fruit",
    description:
      "Vine fruit crop suitable for Mediterranean climate with good drainage.",
    season: "Perennial",
    waterRequirement: "Moderate",
    soilType: "Well-drained, sandy loam",
    growthPeriod: "4-5 months (fruiting)",
  },
  watermelon: {
    emoji: "🍉",
    category: "Fruit",
    description:
      "Water-rich summer fruit requiring warm climate and sandy soil.",
    season: "Summer",
    waterRequirement: "High",
    soilType: "Sandy, well-drained",
    growthPeriod: "80-100 days",
  },
  muskmelon: {
    emoji: "🍈",
    category: "Fruit",
    description: "Sweet summer fruit that grows well in warm, dry climates.",
    season: "Summer",
    waterRequirement: "Moderate",
    soilType: "Sandy loam",
    growthPeriod: "85-100 days",
  },
  apple: {
    emoji: "🍎",
    category: "Fruit",
    description:
      "Temperate fruit crop requiring cool climate and well-drained soil.",
    season: "Perennial",
    waterRequirement: "Moderate",
    soilType: "Well-drained, loamy",
    growthPeriod: "4-6 months (fruiting)",
  },
  orange: {
    emoji: "🍊",
    category: "Fruit",
    description:
      "Citrus fruit rich in vitamin C, suitable for subtropical climate.",
    season: "Perennial",
    waterRequirement: "Moderate",
    soilType: "Well-drained, slightly acidic",
    growthPeriod: "6-8 months (fruiting)",
  },
  papaya: {
    emoji: "🥭",
    category: "Fruit",
    description: "Fast-growing tropical fruit with high nutritional value.",
    season: "Year-round",
    waterRequirement: "Moderate-High",
    soilType: "Well-drained, fertile",
    growthPeriod: "6-12 months",
  },
  coconut: {
    emoji: "🥥",
    category: "Fruit/Oil",
    description:
      "Versatile palm tree providing fruit, oil, and fiber in coastal areas.",
    season: "Perennial",
    waterRequirement: "High",
    soilType: "Sandy, coastal",
    growthPeriod: "12 months (fruiting)",
  },
  cotton: {
    emoji: "🌿",
    category: "Fiber Crop",
    description:
      "Important fiber crop requiring warm climate and moderate rainfall.",
    season: "Kharif",
    waterRequirement: "Moderate",
    soilType: "Black cotton soil",
    growthPeriod: "180-200 days",
  },
  jute: {
    emoji: "🌿",
    category: "Fiber Crop",
    description:
      "Natural fiber crop thriving in humid climate with high rainfall.",
    season: "Kharif",
    waterRequirement: "High",
    soilType: "Alluvial, clayey",
    growthPeriod: "120-150 days",
  },
  coffee: {
    emoji: "☕",
    category: "Beverage Crop",
    description:
      "Shade-loving crop requiring cool, humid climate and well-drained soil.",
    season: "Perennial",
    waterRequirement: "High",
    soilType: "Well-drained, acidic",
    growthPeriod: "6-8 months (fruiting)",
  },
};
