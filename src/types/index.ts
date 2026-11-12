export type Species = "Cachorro" | "Gato";

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: Species;
  breed?: string | null;
  birth_date?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PetWithVaccines extends Pet {
  vaccines?: Vaccine[];
}

export interface Vaccine {
  id: string;
  pet_id: string;
  user_id: string;
  name: string;
  application_date: string;
  next_booster_date?: string | null;
  applied: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  pet?: Pet;
}

export type FoodStatus = "can_eat" | "moderate" | "toxic";

export interface FoodItem {
  id: string;
  name: string;
  species: "dog" | "cat" | "both";
  category: "frutas" | "vegetais" | "proteinas" | "outros";
  status: FoodStatus;
  statusLabel: "Pode comer" | "Com moderação" | "Proibido / Tóxico";
  explanation: string;
  tip?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

