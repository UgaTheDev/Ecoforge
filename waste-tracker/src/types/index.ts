export interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  totalWasteLogged: number;
  avatar?: string;
  rank?: number;
}

export interface WasteEntry {
  id: string;
  userId: string;
  username: string;
  imageUri: string;
  wasteType: WasteType;
  quantity: number;
  points: number;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
}

export enum WasteType {
  FOOD = 'Food Waste',
  PLASTIC = 'Plastic',
  PAPER = 'Paper',
  GLASS = 'Glass',
  METAL = 'Metal',
  ELECTRONIC = 'Electronic',
  ORGANIC = 'Organic',
  TEXTILE = 'Textile',
  HAZARDOUS = 'Hazardous',
  OTHER = 'Other'
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  totalWaste: number;
}

export interface WasteAnalysis {
  wasteType: WasteType;
  confidence: number;
  quantity: number;
  estimatedWeight: number;
}
