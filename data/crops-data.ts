import type { Crop } from "@/components/types/global";

export const availableCrops: Crop[] = [
  // Cereals
  { id: "rice", name: "Rice", emoji: "🌾", category: "Cereals" },
  { id: "wheat", name: "Wheat", emoji: "🌾", category: "Cereals" },
  { id: "corn", name: "Corn", emoji: "🌽", category: "Cereals" },
  { id: "barley", name: "Barley", emoji: "🌾", category: "Cereals" },
  { id: "millet", name: "Millet", emoji: "🌾", category: "Cereals" },

  // Pulses
  { id: "chickpea", name: "Chickpea", emoji: "🫘", category: "Pulses" },
  { id: "lentil", name: "Lentil", emoji: "🫘", category: "Pulses" },
  { id: "blackgram", name: "Black Gram", emoji: "🫘", category: "Pulses" },
  { id: "greengram", name: "Green Gram", emoji: "🫘", category: "Pulses" },
  { id: "pigeon-pea", name: "Pigeon Pea", emoji: "🫘", category: "Pulses" },

  // Vegetables
  { id: "tomato", name: "Tomato", emoji: "🍅", category: "Vegetables" },
  { id: "potato", name: "Potato", emoji: "🥔", category: "Vegetables" },
  { id: "onion", name: "Onion", emoji: "🧅", category: "Vegetables" },
  { id: "cabbage", name: "Cabbage", emoji: "🥬", category: "Vegetables" },
  { id: "carrot", name: "Carrot", emoji: "🥕", category: "Vegetables" },
  { id: "brinjal", name: "Brinjal", emoji: "🍆", category: "Vegetables" },

  // Fruits
  { id: "mango", name: "Mango", emoji: "🥭", category: "Fruits" },
  { id: "banana", name: "Banana", emoji: "🍌", category: "Fruits" },
  { id: "apple", name: "Apple", emoji: "🍎", category: "Fruits" },
  { id: "orange", name: "Orange", emoji: "🍊", category: "Fruits" },
  { id: "grapes", name: "Grapes", emoji: "🍇", category: "Fruits" },

  // Cash Crops
  { id: "cotton", name: "Cotton", emoji: "🌱", category: "Cash Crops" },
  { id: "sugarcane", name: "Sugarcane", emoji: "🎋", category: "Cash Crops" },
  { id: "tobacco", name: "Tobacco", emoji: "🌿", category: "Cash Crops" },
  { id: "jute", name: "Jute", emoji: "🌿", category: "Cash Crops" },

  // Spices
  { id: "turmeric", name: "Turmeric", emoji: "🌿", category: "Spices" },
  { id: "chili", name: "Chili", emoji: "🌶️", category: "Spices" },
  { id: "coriander", name: "Coriander", emoji: "🌿", category: "Spices" },
  { id: "cumin", name: "Cumin", emoji: "🌿", category: "Spices" },
];
