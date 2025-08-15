export const fertilizerMetadata: Record<
  string,
  {
    emoji: string;
    category: string;
    description: string;
    application: string;
    suitableCrops: string[];
    suitableSoils: string[];
  }
> = {
  Urea: {
    emoji: "💧",
    category: "Nitrogen-rich Fertilizer",
    description:
      "Urea (46% Nitrogen) is the most concentrated solid nitrogen fertilizer. It is highly soluble in water and quickly releases nitrogen, promoting leafy and vegetative growth in crops.",
    application:
      "Apply before sowing or during early growth stages. Can be broadcast or applied through fertigation. Avoid application on wet foliage to prevent leaf burn. Incorporate into soil to reduce nitrogen loss.",
    suitableCrops: [
      "Maize",
      "Sugarcane",
      "Cotton",
      "Paddy",
      "Wheat",
      "Barley",
      "Millets",
      "Oil seeds",
      "Pulses",
    ],
    suitableSoils: ["Sandy", "Loamy", "Black", "Red", "Clayey"],
  },
  DAP: {
    emoji: "🟤",
    category: "Phosphorus-rich Fertilizer",
    description:
      "Diammonium Phosphate (DAP) contains 18% Nitrogen and 46% Phosphorus (P₂O₅). It stimulates strong root development and early plant growth.",
    application:
      "Apply as a basal dose during sowing to ensure phosphorus availability during root establishment. Avoid direct seed contact to prevent germination injury.",
    suitableCrops: [
      "Paddy",
      "Wheat",
      "Maize",
      "Barley",
      "Pulses",
      "Oil seeds",
      "Cotton",
      "Tobacco",
    ],
    suitableSoils: ["Loamy", "Black", "Red", "Clayey"],
  },
  "14-35-14": {
    emoji: "⚖️",
    category: "Balanced NPK Fertilizer (High P)",
    description:
      "Contains 14% Nitrogen, 35% Phosphorus, and 14% Potassium. Ideal for promoting root growth and early crop establishment.",
    application:
      "Use as a basal application during planting. Incorporate into soil for maximum efficiency.",
    suitableCrops: ["Paddy", "Wheat", "Maize", "Pulses", "Oil seeds"],
    suitableSoils: ["Sandy", "Loamy", "Black", "Red"],
  },
  "28-28": {
    emoji: "🟢",
    category: "Balanced NPK Fertilizer (High N & P)",
    description:
      "Contains 28% Nitrogen and 28% Phosphorus. Supports early vegetative growth and root establishment.",
    application:
      "Apply during early stages of crop growth. Suitable for crops requiring high nitrogen and phosphorus in initial stages.",
    suitableCrops: ["Paddy", "Maize", "Cotton", "Pulses"],
    suitableSoils: ["Loamy", "Black", "Red", "Clayey"],
  },
  "17-17-17": {
    emoji: "🌾",
    category: "Balanced NPK Fertilizer",
    description:
      "Contains equal proportions of Nitrogen, Phosphorus, and Potassium (17% each). Provides balanced nutrition for various crops.",
    application:
      "Apply as a basal or top dressing depending on crop stage. Useful in multi-cropping systems.",
    suitableCrops: [
      "Paddy",
      "Wheat",
      "Maize",
      "Sugarcane",
      "Cotton",
      "Oil seeds",
      "Pulses",
    ],
    suitableSoils: ["Sandy", "Loamy", "Black", "Red", "Clayey"],
  },
  "20-20": {
    emoji: "🌱",
    category: "Balanced NPK Fertilizer",
    description:
      "Contains 20% Nitrogen and 20% Phosphorus. Promotes balanced vegetative and root growth.",
    application:
      "Apply during active growth stages for optimal results. Can be used as basal or top dressing.",
    suitableCrops: ["Paddy", "Wheat", "Maize", "Oil seeds", "Pulses"],
    suitableSoils: ["Loamy", "Black", "Red"],
  },
  "10-26-26": {
    emoji: "🟠",
    category: "Potassium and Phosphorus-rich Fertilizer",
    description:
      "Contains 10% Nitrogen, 26% Phosphorus, and 26% Potassium. Enhances flowering, fruiting, and resistance to stress.",
    application:
      "Apply during reproductive and fruiting stages for best results. Improves crop quality and yield.",
    suitableCrops: ["Cotton", "Oil seeds", "Pulses", "Sugarcane"],
    suitableSoils: ["Black", "Red", "Clayey"],
  },
};
